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


