"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function UrgencePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [dossierId, setDossierId] = useState("");
  const [raison, setRaison] = useState("");
  const [duree, setDuree] = useState(60);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ expiration: string } | null>(null);

  // Restrict to authorized roles
  if (
    user &&
    !["AMBULANCIER", "MEDECIN_GENERAL", "MEDECIN_SPECIALISTE", "ADMIN"].includes(user.role)
  ) {
    router.replace("/dashboard");
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess(null);

    try {
      const res = await apiFetch(`/urgence/dossier/${dossierId.trim()}`, {
        method: "POST",
        body: JSON.stringify({ raison, dureeMinutes: duree }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erreur lors de la demande");
      }

      const data = await res.json();
      setSuccess({ expiration: data.expiration });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Acces d&apos;urgence</h1>
      <p className="mt-1 text-slate-500">
        Demandez un acces temporaire a un dossier medical en situation d&apos;urgence
      </p>

      {success ? (
        <div className="mt-6 max-w-lg rounded-xl border border-green-200 bg-green-50 p-6">
          <h3 className="font-semibold text-green-800">Acces accorde</h3>
          <p className="mt-1 text-sm text-green-700">
            L&apos;acces d&apos;urgence est actif jusqu&apos;au{" "}
            <span className="font-medium">
              {new Date(success.expiration).toLocaleString("fr-CA")}
            </span>
          </p>
          <button
            onClick={() => router.push(`/dossier/${dossierId.trim()}`)}
            className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-light"
          >
            Voir le dossier
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 max-w-lg">
          <div className="rounded-xl border border-red-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3">
              <svg className="h-5 w-5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 2L2 22h20L12 2z" />
              </svg>
              <p className="text-sm text-red-700">
                Cet acces est journalise. Utilisation a des fins medicales uniquement.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Identifiant du dossier *
                </label>
                <input
                  value={dossierId}
                  onChange={(e) => setDossierId(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Raison de l&apos;urgence *
                </label>
                <textarea
                  value={raison}
                  onChange={(e) => setRaison(e.target.value)}
                  required
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Duree (minutes)
                </label>
                <input
                  type="number"
                  value={duree}
                  onChange={(e) => setDuree(Number(e.target.value))}
                  min={15}
                  max={480}
                  className="w-32 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-danger py-2.5 text-sm font-medium text-white transition-colors hover:bg-danger-light disabled:opacity-50"
              >
                {submitting ? "Demande en cours..." : "Demander l'acces d'urgence"}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
