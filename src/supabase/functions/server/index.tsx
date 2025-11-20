import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Initialize Supabase client for storage
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Ensure storage bucket exists
const BUCKET_NAME = 'make-a80e52b7-recordings';
(async () => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
    if (!bucketExists) {
      await supabase.storage.createBucket(BUCKET_NAME, { public: false });
      console.log(`Created bucket: ${BUCKET_NAME}`);
    }
  } catch (error) {
    console.error('Error creating bucket:', error);
  }
})();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-a80e52b7/health", (c) => {
  return c.json({ status: "ok" });
});

// Get all test sessions
app.get("/make-server-a80e52b7/sessions", async (c) => {
  try {
    const sessions = await kv.getByPrefix("session:");
    return c.json({ sessions: sessions || [] });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return c.json({ error: "Failed to fetch sessions", details: String(error) }, 500);
  }
});

// Save a new test session
app.post("/make-server-a80e52b7/sessions", async (c) => {
  try {
    const body = await c.req.json();
    const sessionId = `session:${Date.now()}`;
    
    const sessionData = {
      id: Date.now(),
      date: new Date().toISOString(),
      participant: body.participant,
      tasks: body.tasks,
      generalObservations: body.generalObservations
    };
    
    await kv.set(sessionId, sessionData);
    
    return c.json({ success: true, sessionId, session: sessionData });
  } catch (error) {
    console.error("Error saving session:", error);
    return c.json({ error: "Failed to save session", details: String(error) }, 500);
  }
});

// Update a session
app.put("/make-server-a80e52b7/sessions/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const sessionKey = id.startsWith("session:") ? id : `session:${id}`;
    
    // Get existing session
    const existingSession = await kv.get(sessionKey);
    if (!existingSession) {
      return c.json({ error: "Session not found" }, 404);
    }
    
    // Update session data while preserving id and date
    const updatedSession = {
      ...existingSession,
      participant: body.participant || existingSession.participant,
      tasks: body.tasks || existingSession.tasks,
      generalObservations: body.generalObservations !== undefined ? body.generalObservations : existingSession.generalObservations,
      recordingUrl: body.recordingUrl !== undefined ? body.recordingUrl : existingSession.recordingUrl,
      transcription: body.transcription !== undefined ? body.transcription : existingSession.transcription,
      timestamps: body.timestamps !== undefined ? body.timestamps : existingSession.timestamps
    };
    
    await kv.set(sessionKey, updatedSession);
    
    return c.json({ success: true, session: updatedSession });
  } catch (error) {
    console.error("Error updating session:", error);
    return c.json({ error: "Failed to update session", details: String(error) }, 500);
  }
});

// Delete a session
app.delete("/make-server-a80e52b7/sessions/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const sessionKey = id.startsWith("session:") ? id : `session:${id}`;
    
    // Get session to check for recording
    const session = await kv.get(sessionKey);
    if (session && session.recordingUrl) {
      // Extract file path from URL and delete from storage
      const filePath = `${id}/recording`;
      await supabase.storage.from(BUCKET_NAME).remove([filePath]);
    }
    
    await kv.del(sessionKey);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting session:", error);
    return c.json({ error: "Failed to delete session", details: String(error) }, 500);
  }
});

// Upload recording for a session
app.post("/make-server-a80e52b7/sessions/:id/recording", async (c) => {
  try {
    const id = c.req.param("id");
    const formData = await c.req.formData();
    const file = formData.get("file") as File;
    const transcription = formData.get("transcription") as string;
    const timestampsStr = formData.get("timestamps") as string;
    
    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }
    
    const sessionKey = id.startsWith("session:") ? id : `session:${id}`;
    
    // Get session data
    const session = await kv.get(sessionKey);
    if (!session) {
      return c.json({ error: "Session not found" }, 404);
    }
    
    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const filePath = `${id}/recording.${fileExt}`;
    
    const fileBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: true
      });
    
    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      return c.json({ error: "Failed to upload file", details: uploadError.message }, 500);
    }
    
    // Get signed URL (valid for 1 year)
    const { data: urlData } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, 31536000); // 1 year in seconds
    
    if (!urlData) {
      return c.json({ error: "Failed to generate signed URL" }, 500);
    }
    
    // Parse timestamps if provided
    let timestamps = [];
    if (timestampsStr) {
      try {
        timestamps = JSON.parse(timestampsStr);
      } catch (e) {
        console.error("Error parsing timestamps:", e);
      }
    }
    
    // Update session with recording URL, transcription, and timestamps
    const updatedSession = {
      ...session,
      recordingUrl: urlData.signedUrl,
      transcription: transcription || '',
      timestamps: timestamps
    };
    
    await kv.set(sessionKey, updatedSession);
    
    return c.json({ success: true, recordingUrl: urlData.signedUrl });
  } catch (error) {
    console.error("Error uploading recording:", error);
    return c.json({ error: "Failed to upload recording", details: String(error) }, 500);
  }
});

// Update session recording metadata
app.put("/make-server-a80e52b7/sessions/:id/recording", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const sessionKey = id.startsWith("session:") ? id : `session:${id}`;
    
    const session = await kv.get(sessionKey);
    if (!session) {
      return c.json({ error: "Session not found" }, 404);
    }
    
    const updatedSession = {
      ...session,
      recordingUrl: body.recordingUrl,
      transcription: body.transcription,
      timestamps: body.timestamps || []
    };
    
    await kv.set(sessionKey, updatedSession);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error updating session recording:", error);
    return c.json({ error: "Failed to update session recording", details: String(error) }, 500);
  }
});

// Delete recording from a session
app.delete("/make-server-a80e52b7/sessions/:id/recording", async (c) => {
  try {
    const id = c.req.param("id");
    const sessionKey = id.startsWith("session:") ? id : `session:${id}`;
    
    // Get session data
    const session = await kv.get(sessionKey);
    if (!session) {
      return c.json({ error: "Session not found" }, 404);
    }
    
    // Delete file from storage if it exists
    if (session.recordingUrl) {
      const filePath = `${id}/recording`;
      try {
        // Try to delete all possible extensions
        const extensions = ['mp4', 'webm', 'mov', 'avi', 'mkv'];
        for (const ext of extensions) {
          await supabase.storage.from(BUCKET_NAME).remove([`${filePath}.${ext}`]);
        }
      } catch (storageError) {
        console.error("Error deleting file from storage:", storageError);
        // Continue even if storage deletion fails
      }
    }
    
    // Update session to remove recording data
    const updatedSession = {
      ...session,
      recordingUrl: undefined,
      transcription: undefined,
      timestamps: undefined
    };
    
    await kv.set(sessionKey, updatedSession);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting recording:", error);
    return c.json({ error: "Failed to delete recording", details: String(error) }, 500);
  }
});

// ========== PROJECT MANAGEMENT ROUTES ==========

// Get all projects
app.get("/make-server-a80e52b7/projects", async (c) => {
  try {
    const projectsList = await kv.get("projects:list");
    const projectIds = Array.isArray(projectsList) ? projectsList : [];
    
    const projects = [];
    for (const id of projectIds) {
      const project = await kv.get(`project:${id}`);
      if (project) {
        projects.push(project);
      }
    }
    
    // Sort by updatedAt (most recent first)
    projects.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    
    return c.json({ projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return c.json({ error: "Failed to fetch projects", details: String(error) }, 500);
  }
});

// Get a single project
app.get("/make-server-a80e52b7/projects/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const project = await kv.get(`project:${id}`);
    
    if (!project) {
      return c.json({ error: "Project not found" }, 404);
    }
    
    return c.json({ project });
  } catch (error) {
    console.error("Error fetching project:", error);
    return c.json({ error: "Failed to fetch project", details: String(error) }, 500);
  }
});

// Create a new project
app.post("/make-server-a80e52b7/projects", async (c) => {
  try {
    const body = await c.req.json();
    const id = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const project = {
      id,
      name: body.name,
      description: body.description,
      createdBy: body.createdBy || 'User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      archived: body.archived || false,
      color: body.color
    };
    
    // Save project
    await kv.set(`project:${id}`, project);
    
    // Add to projects list
    const projectsList = await kv.get("projects:list");
    const projectIds = Array.isArray(projectsList) ? projectsList : [];
    projectIds.push(id);
    await kv.set("projects:list", projectIds);
    
    return c.json({ project });
  } catch (error) {
    console.error("Error creating project:", error);
    return c.json({ error: "Failed to create project", details: String(error) }, 500);
  }
});

// Update a project
app.put("/make-server-a80e52b7/projects/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    
    const existingProject = await kv.get(`project:${id}`);
    if (!existingProject) {
      return c.json({ error: "Project not found" }, 404);
    }
    
    const updatedProject = {
      ...existingProject,
      ...body,
      id: existingProject.id, // Never change ID
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`project:${id}`, updatedProject);
    
    return c.json({ project: updatedProject });
  } catch (error) {
    console.error("Error updating project:", error);
    return c.json({ error: "Failed to update project", details: String(error) }, 500);
  }
});

// Delete a project
app.delete("/make-server-a80e52b7/projects/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    // Delete project
    await kv.del(`project:${id}`);
    
    // Delete protocol
    await kv.del(`protocol:${id}`);
    
    // Delete sessions
    const sessions = await kv.get(`sessions:${id}`);
    if (sessions && Array.isArray(sessions)) {
      for (const sessionId of sessions) {
        await kv.del(`session:${sessionId}`);
      }
      await kv.del(`sessions:${id}`);
    }
    
    // Remove from projects list
    const projectsList = await kv.get("projects:list");
    if (Array.isArray(projectsList)) {
      const filteredList = projectsList.filter(projId => projId !== id);
      await kv.set("projects:list", filteredList);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return c.json({ error: "Failed to delete project", details: String(error) }, 500);
  }
});

// Get project session count
app.get("/make-server-a80e52b7/projects/:id/session-count", async (c) => {
  try {
    const id = c.req.param("id");
    const sessions = await kv.get(`sessions:${id}`);
    const count = Array.isArray(sessions) ? sessions.length : 0;
    
    return c.json({ count });
  } catch (error) {
    console.error("Error getting session count:", error);
    return c.json({ error: "Failed to get session count", details: String(error) }, 500);
  }
});

// Get project last session date
app.get("/make-server-a80e52b7/projects/:id/last-session-date", async (c) => {
  try {
    const id = c.req.param("id");
    const sessionIds = await kv.get(`sessions:${id}`);
    
    if (!sessionIds || !Array.isArray(sessionIds) || sessionIds.length === 0) {
      return c.json({ lastSessionDate: null });
    }
    
    let latestDate = null;
    for (const sessionId of sessionIds) {
      const session = await kv.get(`session:${sessionId}`);
      if (session && session.testDate) {
        const sessionDate = new Date(session.testDate);
        if (!latestDate || sessionDate > new Date(latestDate)) {
          latestDate = session.testDate;
        }
      }
    }
    
    return c.json({ lastSessionDate: latestDate });
  } catch (error) {
    console.error("Error getting last session date:", error);
    return c.json({ error: "Failed to get last session date", details: String(error) }, 500);
  }
});

// ========== PROTOCOL MANAGEMENT ROUTES ==========

// Get protocol for a project
app.get("/make-server-a80e52b7/protocols/:projectId", async (c) => {
  try {
    const projectId = c.req.param("projectId");
    const protocol = await kv.get(`protocol:${projectId}`);
    
    if (!protocol) {
      return c.json({ protocol: null });
    }
    
    return c.json({ protocol });
  } catch (error) {
    console.error("Error fetching protocol:", error);
    return c.json({ error: "Failed to fetch protocol", details: String(error) }, 500);
  }
});

// Save/update protocol for a project
app.put("/make-server-a80e52b7/protocols/:projectId", async (c) => {
  try {
    const projectId = c.req.param("projectId");
    const body = await c.req.json();
    
    const protocol = {
      projectId,
      demographicQuestions: body.demographicQuestions || [],
      metrics: body.metrics || [],
      tasks: body.tasks || [],
      postTestQuestions: body.postTestQuestions || []
    };
    
    await kv.set(`protocol:${projectId}`, protocol);
    
    return c.json({ protocol });
  } catch (error) {
    console.error("Error saving protocol:", error);
    return c.json({ error: "Failed to save protocol", details: String(error) }, 500);
  }
});

// Delete protocol
app.delete("/make-server-a80e52b7/protocols/:projectId", async (c) => {
  try {
    const projectId = c.req.param("projectId");
    await kv.del(`protocol:${projectId}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting protocol:", error);
    return c.json({ error: "Failed to delete protocol", details: String(error) }, 500);
  }
});

// ========== GLOBAL PROTOCOL ROUTES (for Alivia app) ==========

// Get global protocol tasks
app.get("/make-server-a80e52b7/protocol", async (c) => {
  try {
    console.log("📖 GET /protocol - Chargement du protocole...");
    const protocol = await kv.get("alivia:protocol:tasks");
    
    if (!protocol) {
      console.log("⚠️ Aucun protocole trouvé dans la base");
      return c.json({ tasks: null, timestamp: null });
    }
    
    console.log("✅ Protocole chargé avec", protocol.tasks?.length || 0, "tâches, timestamp:", protocol.timestamp);
    return c.json({ tasks: protocol.tasks, timestamp: protocol.timestamp });
  } catch (error) {
    console.error("❌ Error fetching protocol:", error);
    return c.json({ error: "Failed to fetch protocol", details: String(error) }, 500);
  }
});

// Save global protocol tasks
app.post("/make-server-a80e52b7/protocol", async (c) => {
  try {
    const body = await c.req.json();
    
    if (!body.tasks || !Array.isArray(body.tasks)) {
      console.log("❌ Données invalides reçues");
      return c.json({ error: "Invalid tasks data" }, 400);
    }
    
    const protocol = {
      tasks: body.tasks,
      timestamp: Date.now()
    };
    
    console.log("💾 POST /protocol - Sauvegarde de", body.tasks.length, "tâches avec timestamp:", protocol.timestamp);
    await kv.set("alivia:protocol:tasks", protocol);
    console.log("✅ Protocole sauvegardé avec succès");
    
    return c.json({ success: true, timestamp: protocol.timestamp });
  } catch (error) {
    console.error("❌ Error saving protocol:", error);
    return c.json({ error: "Failed to save protocol", details: String(error) }, 500);
  }
});

// Get protocol timestamp only (for checking updates)
app.get("/make-server-a80e52b7/protocol/timestamp", async (c) => {
  try {
    const protocol = await kv.get("alivia:protocol:tasks");
    const timestamp = protocol?.timestamp || null;
    
    return c.json({ timestamp });
  } catch (error) {
    console.error("❌ Error fetching timestamp:", error);
    return c.json({ error: "Failed to fetch timestamp", details: String(error) }, 500);
  }
});

// Debug endpoint - voir toutes les données du protocole
app.get("/make-server-a80e52b7/protocol/debug", async (c) => {
  try {
    const protocol = await kv.get("alivia:protocol:tasks");
    const sections = await kv.get("alivia:protocol:sections");
    
    return c.json({ 
      protocol,
      sections,
      tasksCount: protocol?.tasks?.length || 0,
      timestamp: protocol?.timestamp || null
    });
  } catch (error) {
    console.error("❌ Error in debug:", error);
    return c.json({ error: "Failed to debug", details: String(error) }, 500);
  }
});

// Get global protocol sections
app.get("/make-server-a80e52b7/protocol/sections", async (c) => {
  try {
    const sections = await kv.get("alivia:protocol:sections");
    
    if (!sections) {
      return c.json({ sections: null });
    }
    
    return c.json({ sections });
  } catch (error) {
    console.error("Error fetching protocol sections:", error);
    return c.json({ error: "Failed to fetch protocol sections", details: String(error) }, 500);
  }
});

// Save global protocol sections
app.post("/make-server-a80e52b7/protocol/sections", async (c) => {
  try {
    const body = await c.req.json();
    
    if (!body.sections) {
      return c.json({ error: "Invalid sections data" }, 400);
    }
    
    await kv.set("alivia:protocol:sections", body.sections);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error saving protocol sections:", error);
    return c.json({ error: "Failed to save protocol sections", details: String(error) }, 500);
  }
});

// ========== STUDY METADATA ROUTES ==========

// Get current study metadata
app.get("/make-server-a80e52b7/study", async (c) => {
  try {
    let study = await kv.get("alivia:study:current");

    if (!study) {
      const now = new Date().toISOString();
      study = {
        id: "alivia_default_study",
        title: "Étude UX Alivia V2",
        createdAt: now,
        updatedAt: now,
      };
      await kv.set("alivia:study:current", study);
    }

    return c.json({ study });
  } catch (error) {
    console.error("Error fetching study metadata:", error);
    return c.json(
      { error: "Failed to fetch study metadata", details: String(error) },
      500,
    );
  }
});

// Create/update current study metadata
app.post("/make-server-a80e52b7/study", async (c) => {
  try {
    const body = await c.req.json();
    const existing = await kv.get("alivia:study:current");
    const now = new Date().toISOString();

    const study = {
      id: body.id || existing?.id || "alivia_default_study",
      title: body.title || existing?.title || "Étude sans titre",
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    await kv.set("alivia:study:current", study);

    return c.json({ study });
  } catch (error) {
    console.error("Error saving study metadata:", error);
    return c.json(
      { error: "Failed to save study metadata", details: String(error) },
      500,
    );
  }
});

Deno.serve(app.fetch);
