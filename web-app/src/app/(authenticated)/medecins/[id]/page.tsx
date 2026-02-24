"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-api";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { getRoleLabel } from "@/lib/roles";
import LoadingSpinner from "@/components/loading-spinner";
import ErrorMessage from "@/components/error-message";
import EtablissementAutocomplete from "@/components/ui/etablissement-autocomplete";

interface MedecinProfil {
  id_utilisateur: string;
  nom: string;
  prenom: string;
  email: string;
  role: "MEDECIN_GENERAL" | "MEDECIN_SPECIALISTE";
  institution: string | null;
  createdAt: string;
  nb_dossiers: number;
}

export default function MedecinProfilPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { data: medecin, loading, error, refetch } = useApi<MedecinProfil>(`/medecins/${id}`);

  const [editingInstitution, setEditingInstitution] = useState(false);
  const [institutionValue, setInstitutionValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;
  if (!medecin) return null;

  const peutModifier = user && (user.id === id || user.role === "ADMIN");

  function startEdit() {
    setInstitutionValue(medecin!.institution || "");
    setEditingInstitution(true);
    setSaveError("");
  }

  async function saveInstitution() {
    setSaving(true);
    setSaveError("");
    try {
      const res = await apiFetch(`/medecins/${id}/institution`, {
        method: "PATCH",
        body: JSON.stringify({ institution: institutionValue }),
      });
      if (!res.ok) throw new Error("Erreur lors de la sauvegarde");
      setEditingInstitution(false);
      refetch();
    } catch {
      setSaveError("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  }

  const titre = medecin.role === "MEDECIN_SPECIALISTE"
    ? `Dre ${medecin.prenom} ${medecin.nom}`
    : `Dr ${medecin.prenom} ${medecin.nom}`;

  return (
    <div className="max-w-2xl">
      <button
        onClick={() => router.push("/medecins")}
        className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Retour à la liste
      </button>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* En-tête */}
        <div className="flex items-center gap-5 border-b border-slate-100 p-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
            {medecin.prenom[0]}{medecin.nom[0]}
          </div>
          <div className="flex flex-1 items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900">{titre}</h1>
              <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                medecin.role === "MEDECIN_SPECIALISTE"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-blue-100 text-blue-700"
              }`}>
                {getRoleLabel(medecin.role)}
              </span>
            </div>
            <a
              href={`mailto:${medecin.email}`}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-primary"
              title={`Envoyer un courriel à ${titre}`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contacter
            </a>
          </div>
        </div>

        {/* Informations */}
        <div className="divide-y divide-slate-100">
          {/* Courriel */}
          <div className="flex items-center px-6 py-4">
            <span className="w-40 shrink-0 text-sm font-medium text-slate-500">Courriel</span>
            <a
              href={`mailto:${medecin.email}`}
              className="text-sm text-primary hover:underline"
            >
              {medecin.email}
            </a>
          </div>

          {/* Institution */}
          <div className="flex items-center justify-between px-6 py-4">
            <span className="w-40 shrink-0 text-sm font-medium text-slate-500">Institution</span>
            {editingInstitution ? (
              <div className="flex flex-1 items-center gap-2">
                <EtablissementAutocomplete
                  value={institutionValue}
                  onChange={setInstitutionValue}
                  autoFocus
                  className="flex-1 rounded-md border border-primary-light px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light/30"
                />
                <button
                  onClick={saveInstitution}
                  disabled={saving}
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-dark disabled:opacity-50"
                >
                  {saving ? "..." : "OK"}
                </button>
                <button
                  onClick={() => setEditingInstitution(false)}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-between">
                <span className="text-sm text-slate-900">
                  {medecin.institution || <span className="italic text-slate-400">Non renseignée</span>}
                </span>
                {peutModifier && (
                  <button
                    onClick={startEdit}
                    className="ml-2 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    title="Modifier l'institution"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
              </div>
            )}
            {saveError && <p className="mt-1 text-xs text-red-600">{saveError}</p>}
          </div>

          <div className="flex items-center px-6 py-4">
            <span className="w-40 shrink-0 text-sm font-medium text-slate-500">Dossiers suivis</span>
            <span className="text-sm text-slate-900">{medecin.nb_dossiers}</span>
          </div>

          <div className="flex items-center px-6 py-4">
            <span className="w-40 shrink-0 text-sm font-medium text-slate-500">Membre depuis</span>
            <span className="text-sm text-slate-900">
              {new Date(medecin.createdAt).toLocaleDateString("fr-CA", {
                year: "numeric",
                month: "long",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
