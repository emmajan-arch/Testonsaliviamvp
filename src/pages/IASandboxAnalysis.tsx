import { useEffect, useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";
import { analyzeCommonConcernsForStudy } from "../services/ai";
import {
  fetchSessions,
  updateSession,
  uploadRecording,
  type TestSession,
} from "../utils/supabase/sessions";
import { ArrowLeft } from "lucide-react";

/**
 * Page sandbox isolée pour tester l'analyse IA des préoccupations communes.
 * Cette page n'est pas branchée à l'interface principale par défaut.
 */
export function IASandboxAnalysis() {
  const [studyId, setStudyId] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<TestSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
    null
  );
  const [transcriptionDraft, setTranscriptionDraft] = useState("");
  const [isSavingTranscription, setIsSavingTranscription] = useState(false);
  const [pendingVideoFile, setPendingVideoFile] = useState<File | null>(null);
  const [videoUploadStatus, setVideoUploadStatus] = useState<
    "idle" | "ready" | "uploading" | "success" | "error"
  >("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("studyId");
      if (id) {
        setStudyId(id);
      }
    } catch (error) {
      console.error("Impossible de lire le studyId depuis l'URL:", error);
    }
  }, []);

  // Charger les sessions pour l'étude (ou toutes si studyId non renseigné / non présent)
  useEffect(() => {
    const loadSessions = async () => {
      try {
        setIsLoadingSessions(true);
        const all = await fetchSessions();

        let filtered: TestSession[] = all;
        if (studyId.trim()) {
          const byStudy = all.filter(
            (session: any) => session.studyId === studyId.trim()
          );
          filtered = byStudy.length > 0 ? byStudy : all;
        }

        setSessions(filtered);
      } catch (err) {
        console.error(
          "Impossible de charger les sessions pour la sandbox IA:",
          err
        );
      } finally {
        setIsLoadingSessions(false);
      }
    };

    loadSessions();
  }, [studyId]);

  const handleSelectSession = (session: TestSession) => {
    setSelectedSessionId(session.id);
    setTranscriptionDraft(session.transcription ?? "");
  };

  const handleSaveTranscription = async () => {
    if (!selectedSessionId) return;

    try {
      setIsSavingTranscription(true);
      const updated = await updateSession(selectedSessionId, {
        transcription: transcriptionDraft,
      });
      setSessions((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      );
    } catch (err) {
      console.error("Erreur lors de la sauvegarde de la transcription:", err);
      setError(
        "Erreur lors de la sauvegarde de la transcription. Vérifie ta connexion puis réessaie."
      );
    } finally {
      setIsSavingTranscription(false);
    }
  };

  const handleTextFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const ext = file.name.split(".").pop()?.toLowerCase();
      const isPlainText =
        file.type.startsWith("text/") ||
        ["txt", "md", "markdown", "json", "srt", "vtt"].includes(ext || "");

      if (!isPlainText) {
        setError(
          "L'import automatique de PDF / DOCX n'est pas encore supporté. Convertis d'abord ton document en texte brut (txt, md…) puis réimporte-le ou colle-le dans la zone de transcription."
        );
        return;
      }

      const text = await file.text();
      setTranscriptionDraft((prev) =>
        prev ? `${prev}\n\n${text}` : text ?? ""
      );
    } catch (err) {
      console.error("Impossible de lire le fichier de transcription:", err);
      setError(
        "Impossible de lire le fichier de transcription. Essaye avec un autre format texte (txt, md, json, srt…)."
      );
    } finally {
      event.target.value = "";
    }
  };

  const handleVideoFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !selectedSessionId) {
      event.target.value = "";
      return;
    }

    setPendingVideoFile(file);
    setVideoUploadStatus("ready");
    event.target.value = "";
  };

  const handleConfirmVideoUpload = async () => {
    if (!pendingVideoFile || !selectedSessionId) return;

    try {
      setVideoUploadStatus("uploading");
      const currentSession = sessions.find(
        (s) => s.id === selectedSessionId
      );
      const transcriptionToSend =
        transcriptionDraft || currentSession?.transcription || "";

      const recordingUrl = await uploadRecording(
        selectedSessionId,
        pendingVideoFile,
        transcriptionToSend
      );

      setSessions((prev) =>
        prev.map((s) =>
          s.id === selectedSessionId ? { ...s, recordingUrl } : s
        )
      );
      setVideoUploadStatus("success");
      setPendingVideoFile(null);
    } catch (err) {
      console.error("Erreur lors de l'upload de la vidéo:", err);
      setError(
        "Erreur lors de l'upload de la vidéo. Vérifie ta connexion puis réessaie."
      );
      setVideoUploadStatus("error");
    }
  };

  const handleAnalyze = async () => {
    setError(null);
    setResult(null);

    if (!studyId.trim()) {
      setError("Merci de saisir un studyId avant de lancer l'analyse.");
      return;
    }

    try {
      setIsLoading(true);
      const analysis = await analyzeCommonConcernsForStudy(studyId.trim());
      setResult(analysis);
    } catch (err: any) {
      console.error("Erreur lors de l'analyse IA:", err);
      setError(
        err?.message ??
          "Une erreur est survenue lors de l'appel à l'API d'analyse IA."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-3xl">
        <Card className="shadow-xl border-slate-200">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-semibold text-slate-900">
                  Sandbox IA – Analyse des préoccupations communes
                </CardTitle>
                <p className="text-sm text-slate-600">
                  Cette page est une sandbox isolée pour expérimenter une
                  analyse IA des sessions par étude. Elle n&apos;affecte pas
                  l&apos;interface principale.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => {
                  window.location.href = "/";
                }}
              >
                <ArrowLeft className="h-4 w-4" />
                Retour au produit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="studyId"
                className="block text-sm font-medium text-slate-800"
              >
                studyId à analyser
              </label>
              <Input
                id="studyId"
                placeholder="Ex. study_123"
                value={studyId}
                onChange={(e) => setStudyId(e.target.value)}
              />
              <p className="text-xs text-slate-500">
                Saisis l&apos;identifiant de l&apos;étude pour laquelle tu veux
                analyser les préoccupations communes.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={handleAnalyze} disabled={isLoading}>
                {isLoading
                  ? "Analyse en cours..."
                  : "Analyser les préoccupations communes (IA)"}
              </Button>
              {isLoading && (
                <span className="text-xs text-slate-500">
                  L&apos;analyse peut prendre quelques secondes.
                </span>
              )}
            </div>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-slate-800">
                  Transcriptions des sessions pour cette étude
                </h2>
                {isLoadingSessions && (
                  <span className="text-xs text-slate-500">
                    Chargement des sessions…
                  </span>
                )}
              </div>

              {sessions.length === 0 && !isLoadingSessions && (
                <p className="text-xs text-slate-500">
                  Aucune session trouvée pour cette étude pour l&apos;instant.
                </p>
              )}

              {sessions.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {sessions.map((session) => (
                    <button
                      key={session.id}
                      type="button"
                      onClick={() => handleSelectSession(session)}
                      className={`w-full text-left rounded-md border px-3 py-2 text-xs ${
                        selectedSessionId === session.id
                          ? "border-[var(--accent)] bg-white"
                          : "border-slate-200 bg-white/70 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-medium text-slate-900 text-xs">
                            Session {session.id} —{" "}
                            {session.participant?.name || "Sans nom"}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {session.participant?.role || "Rôle inconnu"} ·{" "}
                            {session.transcription
                              ? "Transcription disponible"
                              : "Pas encore de transcription"}
                          </p>
                        </div>
                        {(session.recordingUrl ||
                          (session as any).videoUrl) && (
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700">
                            Vidéo importée
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedSessionId && (
                <div className="mt-3 space-y-3 border-t border-slate-200 pt-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">
                      Transcription de la session sélectionnée
                    </label>
                    <Textarea
                      value={transcriptionDraft}
                      onChange={(e) => setTranscriptionDraft(e.target.value)}
                      className="min-h-[160px] text-xs"
                      placeholder="Colle ici la transcription brute de la session…"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleSaveTranscription}
                      disabled={isSavingTranscription}
                    >
                      {isSavingTranscription
                        ? "Enregistrement…"
                        : "Enregistrer la transcription"}
                    </Button>

                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-slate-300 bg-white px-2 py-1 hover:border-slate-400">
                      <span className="text-[11px] text-slate-600">
                        Importer un fichier texte / document (.txt, .md, .json, .srt, .pdf, .docx…)
                      </span>
                      <input
                        type="file"
                        accept=".txt,.md,.markdown,.json,.srt,.vtt,.pdf,.doc,.docx,text/plain,application/json,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        className="hidden"
                        onChange={handleTextFileChange}
                      />
                    </label>

                    <div className="space-y-1">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-slate-300 bg-white px-2 py-1 hover:border-slate-400">
                        <span className="text-[11px] text-slate-600">
                          Sélectionner une vidéo (MP4, WebM…)
                        </span>
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={handleVideoFileChange}
                        />
                      </label>
                      {pendingVideoFile && (
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                          <span className="truncate max-w-[160px]">
                            Fichier sélectionné : {pendingVideoFile.name}
                          </span>
                          {videoUploadStatus === "ready" && (
                            <Button
                              type="button"
                              size="sm"
                              className="h-6 px-2 text-[11px]"
                              onClick={handleConfirmVideoUpload}
                            >
                              Valider l&apos;upload
                            </Button>
                          )}
                          {videoUploadStatus === "uploading" && (
                            <span className="text-[11px] text-slate-500">
                              Upload en cours…
                            </span>
                          )}
                          {videoUploadStatus === "success" && (
                            <span className="text-[11px] text-emerald-600">
                              Upload terminé
                            </span>
                          )}
                          {videoUploadStatus === "error" && (
                            <span className="text-[11px] text-red-600">
                              Erreur lors de l&apos;upload
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {result && !error && (
              <div className="space-y-4">
                <h2 className="text-base font-semibold text-slate-800">
                  Synthèse UX générée par l’IA
                </h2>
                <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-900 whitespace-pre-wrap leading-relaxed">
                  {result}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


