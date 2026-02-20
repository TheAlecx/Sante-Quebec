import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth-context";
import { apiFetch } from "../lib/api";

interface DossierItem {
  id_dossier: string;
  patient: { nom: string; prenom: string; date_naissance: string; sexe: "HOMME" | "FEMME"; numero_assurance?: string; };
}

function getAge(d: string) {
  const birth = new Date(d);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  if (now.getMonth() - birth.getMonth() < 0 || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--;
  return age;
}

export default function PatientsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dossiers, setDossiers] = useState<DossierItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    apiFetch("/patients/dossiers")
      .then(r => r.ok ? r.json() : [])
      .then(setDossiers)
      .catch(() => setDossiers([]))
      .finally(() => setLoading(false));
  }, []);

  if (!user) return null;

  const filtered = dossiers.filter(d => {
    const q = search.toLowerCase();
    return (
      d.patient.nom.toLowerCase().includes(q) ||
      d.patient.prenom.toLowerCase().includes(q) ||
      (d.patient.numero_assurance?.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patients</h1>
          <p className="mt-1 text-slate-500">{dossiers.length} dossier{dossiers.length > 1 ? "s" : ""} accessible{dossiers.length > 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Recherche */}
      <div className="mt-6">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou numéro d'assurance…"
          className="w-full max-w-md rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-primary-light focus:outline-none"
        />
      </div>

      {/* Liste */}
      {loading ? (
        <div className="mt-10 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-10 rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          {search ? "Aucun résultat pour cette recherche." : "Aucun patient accessible."}
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(d => (
            <button
              key={d.id_dossier}
              onClick={() => navigate(`/patients/${d.id_dossier}`)}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:border-primary-light hover:shadow-md"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {d.patient.prenom[0]}{d.patient.nom[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-900">{d.patient.nom}, {d.patient.prenom}</p>
                <p className="mt-0.5 text-sm text-slate-500">
                  {d.patient.sexe === "HOMME" ? "Homme" : "Femme"} · {getAge(d.patient.date_naissance)} ans
                </p>
                {d.patient.numero_assurance && (
                  <p className="mt-0.5 text-xs text-slate-400">{d.patient.numero_assurance}</p>
                )}
              </div>
              <svg className="h-4 w-4 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
