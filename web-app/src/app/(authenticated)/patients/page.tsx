"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-api";
import LoadingSpinner from "@/components/loading-spinner";
import ErrorMessage from "@/components/error-message";

interface DossierItem {
  id_dossier: string;
  etat: string;
  patient: {
    nom: string;
    prenom: string;
    date_naissance: string;
    sexe: string;
    numero_assurance: string | null;
  };
  permissions: {
    lecture: boolean;
    ajout: boolean;
    modification: boolean;
    suppression: boolean;
  };
}

export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { data, loading, error, refetch } = useApi<DossierItem[]>("/patients/dossiers");

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  const dossiers = data || [];

  const filtered = dossiers.filter((d) => {
    const q = search.toLowerCase();
    return (
      d.patient.nom.toLowerCase().includes(q) ||
      d.patient.prenom.toLowerCase().includes(q) ||
      (d.patient.numero_assurance || "").toLowerCase().includes(q)
    );
  });

  function getAge(dateNaissance: string) {
    const birth = new Date(dateNaissance);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patients</h1>
          <p className="mt-1 text-slate-500">
            {dossiers.length} dossier{dossiers.length > 1 ? "s" : ""} accessible{dossiers.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom, prenom ou # assurance..."
          className="w-full max-w-md rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
        />
      </div>

      <div className="mt-4 grid gap-3">
        {filtered.map((d) => (
          <button
            key={d.id_dossier}
            onClick={() => router.push(`/dossier/${d.id_dossier}`)}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:border-primary-light hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {d.patient.prenom[0]}{d.patient.nom[0]}
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  {d.patient.nom}, {d.patient.prenom}
                </p>
                <p className="text-sm text-slate-500">
                  {getAge(d.patient.date_naissance)} ans &middot; {d.patient.sexe === "HOMME" ? "H" : "F"}
                  {d.patient.numero_assurance && (
                    <> &middot; {d.patient.numero_assurance}</>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {d.permissions.ajout && (
                  <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Ajout</span>
                )}
                {d.permissions.modification && (
                  <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Modif</span>
                )}
                {d.permissions.suppression && (
                  <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Suppr</span>
                )}
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                d.etat === "ACTIF" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
              }`}>
                {d.etat}
              </span>
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Aucun patient trouve pour &laquo; {search} &raquo;
          </div>
        )}
      </div>
    </div>
  );
}
