import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { getRoleLabel } from "../lib/roles";
import type { Role } from "../lib/types";

interface Medecin {
  id_utilisateur: string;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
  institution?: string;
  numero_praticien?: string;
}

export default function MedecinsPage() {
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    apiFetch("/medecins")
      .then(r => r.ok ? r.json() : [])
      .then(setMedecins)
      .catch(() => setMedecins([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = medecins.filter(m => {
    const q = search.toLowerCase();
    return (
      m.nom.toLowerCase().includes(q) ||
      m.prenom.toLowerCase().includes(q) ||
      (m.institution?.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Médecins</h1>
      <p className="mt-1 text-slate-500">{medecins.length} professionnel{medecins.length > 1 ? "s" : ""}</p>

      <div className="mt-6">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou institution…"
          className="w-full max-w-md rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-primary-light focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="mt-10 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-10 rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          {search ? "Aucun résultat." : "Aucun médecin enregistré."}
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(m => (
            <div key={m.id_utilisateur}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {m.prenom[0]}{m.nom[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{m.prenom} {m.nom}</p>
                  <p className="text-sm text-primary">{getRoleLabel(m.role)}</p>
                </div>
              </div>
              <div className="mt-3 space-y-1 text-sm text-slate-600">
                {m.institution && (
                  <p><span className="text-slate-400">Établissement :</span> {m.institution}</p>
                )}
                {m.numero_praticien && (
                  <p><span className="text-slate-400">N° praticien :</span> {m.numero_praticien}</p>
                )}
                <p>
                  <a href={`mailto:${m.email}`}
                    className="text-primary hover:underline">{m.email}</a>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
