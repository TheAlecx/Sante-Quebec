"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-api";
import { getRoleLabel } from "@/lib/roles";
import LoadingSpinner from "@/components/loading-spinner";
import ErrorMessage from "@/components/error-message";

interface Medecin {
  id_utilisateur: string;
  nom: string;
  prenom: string;
  role: "MEDECIN_GENERAL" | "MEDECIN_SPECIALISTE";
  institution: string | null;
}

export default function MedecinsPage() {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { data, loading, error, refetch } = useApi<Medecin[]>("/medecins");

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  const medecins = data || [];

  const filtered = medecins.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.nom.toLowerCase().includes(q) ||
      m.prenom.toLowerCase().includes(q) ||
      (m.institution || "").toLowerCase().includes(q)
    );
  });

  const generaux = filtered.filter((m) => m.role === "MEDECIN_GENERAL");
  const specialistes = filtered.filter((m) => m.role === "MEDECIN_SPECIALISTE");

  function MedecinCard({ m }: { m: Medecin }) {
    return (
      <button
        onClick={() => router.push(`/medecins/${m.id_utilisateur}`)}
        className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:border-primary-light hover:shadow-md"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
          {(m.prenom[0] || "")}{(m.nom[0] || "")}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900">
            Dr{m.role === "MEDECIN_SPECIALISTE" ? "e" : ""} {m.prenom} {m.nom}
          </p>
          <p className="text-sm text-slate-500 truncate">
            {m.institution || <span className="italic">Institution non renseignée</span>}
          </p>
        </div>
        <svg className="h-5 w-5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    );
  }

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Médecins</h1>
        <p className="mt-1 text-slate-500">
          {medecins.length} médecin{medecins.length > 1 ? "s" : ""} enregistré{medecins.length > 1 ? "s" : ""}
        </p>
      </div>

      <div className="mt-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou institution..."
          className="w-full max-w-md rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          {search ? <>Aucun médecin trouvé pour &laquo; {search} &raquo;</> : "Aucun médecin enregistré"}
        </div>
      ) : (
        <div className="mt-4 space-y-6">
          {generaux.length > 0 && (
            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                {getRoleLabel("MEDECIN_GENERAL")} ({generaux.length})
              </h2>
              <div className="grid gap-3">
                {generaux.map((m) => <MedecinCard key={m.id_utilisateur} m={m} />)}
              </div>
            </section>
          )}
          {specialistes.length > 0 && (
            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                {getRoleLabel("MEDECIN_SPECIALISTE")} ({specialistes.length})
              </h2>
              <div className="grid gap-3">
                {specialistes.map((m) => <MedecinCard key={m.id_utilisateur} m={m} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
