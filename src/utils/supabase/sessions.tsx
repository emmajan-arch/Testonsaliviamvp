import { projectId, publicAnonKey } from './info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-a80e52b7`;

export interface VideoTimestamp {
  id: string;
  time: number; // en secondes
  label: string;
  description?: string;
  taskId?: number; // Lien optionnel vers une tâche
}

export interface TaskResult {
  taskId: number;
  title: string;
  success: boolean;
  duration?: string;
  autonomy?: string;
  pathFluidity?: string;
  emotionalReaction?: string;
  searchMethod?: string[]; // Array pour sélection multiple
  notes: string;
  verbatim?: string;
  taskVerbatimsPositive?: string;
  taskVerbatimsNegative?: string;
  ease?: number; // Métrique numérique standard (échelle 1-10)
  sourcesUnderstanding?: number;
  confidenceLevel?: number;
  valuePropositionClarity?: number;
  firstImpression?: number;
  postTestImpression?: string;
  postTestLiked?: string;
  postTestFrustrations?: string;
  postTestDataStorage?: string;
  postTestPracticalUse?: string;
  postTestAdoption?: number; // Score d'adoption (échelle 1-10) : "A quel point vous voyez utiliser le produit au quotidien ?"
  timeSpent?: number;
  clicks?: number;
  hesitations?: number;
  errorsCount?: number;
  skipped?: boolean; // Pour marquer une tâche comme non effectuée (optionnelle - tâche 10)
}

export interface TestSession {
  id: number;
  date: string;
  participant: {
    name: string;
    role: string;
    experience: string;
    department?: string;
    aiToolsFrequency?: string;
    aiToolsEase?: string;
    aliviaFrequency?: string;
  };
  tasks: TaskResult[];
  generalObservations: string;
  recordingUrl?: string;
  transcription?: string;
  timestamps?: VideoTimestamp[];
}

// Fetch all sessions from Supabase
export async function fetchSessions(): Promise<TestSession[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/sessions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Error fetching sessions from Supabase:', error);
      throw new Error(`Failed to fetch sessions: ${response.statusText}`);
    }

    const data = await response.json();
    return data.sessions || [];
  } catch (error) {
    console.error('Error in fetchSessions:', error);
    throw error;
  }
}

// Save a session to Supabase
export async function saveSession(session: Omit<TestSession, 'id' | 'date'>): Promise<TestSession> {
  try {
    const response = await fetch(`${API_BASE_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(session)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Error saving session to Supabase:', error);
      throw new Error(`Failed to save session: ${response.statusText}`);
    }

    const data = await response.json();
    return data.session;
  } catch (error) {
    console.error('Error in saveSession:', error);
    throw error;
  }
}

// Delete a session from Supabase
export async function deleteSession(sessionId: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Error deleting session from Supabase:', error);
      throw new Error(`Failed to delete session: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error in deleteSession:', error);
    throw error;
  }
}

// Sync localStorage with Supabase (cloud is the source of truth)
export async function syncWithSupabase(): Promise<TestSession[]> {
  try {
    // Get cloud sessions - cloud is the ONLY source of truth
    const cloudSessions = await fetchSessions();
    
    // COMPLETELY replace localStorage with cloud data
    // This ensures deleted sessions stay deleted
    localStorage.setItem('testSessions', JSON.stringify(cloudSessions));
    
    return cloudSessions;
  } catch (error) {
    console.error('Error in syncWithSupabase:', error);
    // Fallback to local sessions if sync fails
    return JSON.parse(localStorage.getItem('testSessions') || '[]');
  }
}

// Upload recording file to Supabase Storage and update session
export async function uploadRecording(sessionId: number, file: File, transcription: string, timestamps?: VideoTimestamp[]): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sessionId', sessionId.toString());
    formData.append('transcription', transcription);
    if (timestamps) {
      formData.append('timestamps', JSON.stringify(timestamps));
    }

    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/recording`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Error uploading recording to Supabase:', error);
      throw new Error(`Failed to upload recording: ${response.statusText}`);
    }

    const data = await response.json();
    return data.recordingUrl;
  } catch (error) {
    console.error('Error in uploadRecording:', error);
    throw error;
  }
}

// Update session with recording URL and transcription
export async function updateSessionRecording(sessionId: number, recordingUrl: string, transcription: string, timestamps?: VideoTimestamp[]): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/recording`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ recordingUrl, transcription, timestamps })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Error updating session recording:', error);
      throw new Error(`Failed to update session recording: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error in updateSessionRecording:', error);
    throw error;
  }
}

// Delete recording from a session
export async function deleteRecording(sessionId: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/recording`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Error deleting recording from Supabase:', error);
      throw new Error(`Failed to delete recording: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error in deleteRecording:', error);
    throw error;
  }
}

// Update a complete session
export async function updateSession(sessionId: number, sessionData: Partial<TestSession>): Promise<TestSession> {
  try {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sessionData)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Error updating session:', error);
      throw new Error(`Failed to update session: ${response.statusText}`);
    }

    const data = await response.json();
    return data.session;
  } catch (error) {
    console.error('Error in updateSession:', error);
    throw error;
  }
}
