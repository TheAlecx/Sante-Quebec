import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth-context";
import { apiFetch } from "../lib/api";

interface PatientTrouve {
  dossier_id: string;
  patient: { nom: string; prenom: string; date_naissance: string; sexe: string; numero_assurance: string | null; telephone: string | null; };
  prescriptions: { id_prescription: string; medicaments: { medicament: { nom: string; dosage: string | null } }[] }[];
}

function toDatetimeLocal(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function UrgencePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [numeroAssurance, setNumeroAssurance] = useState("");
  const [recherche, setRecherche] = useState(false);
  const [patientTrouve, setPatientTrouve] = useState<PatientTrouve | null>(null);
  const [patientNonTrouve, setPatientNonTrouve] = useState(false);
  const [dossierId, setDossierId] = useState("");
  const [formulaireVisible, setFormulaireVisible] = useState(false);

  const now = new Date();
  const [raison, setRaison] = useState("");
  const [datePickup, setDatePickup] = useState(toDatetimeLocal(now));
  const [dateArrivee, setDateArrivee] = useState(toDatetimeLocal(now));
  const [numAssuranceSaisie, setNumAssuranceSaisie] = useState("");
  const [duree, setDuree] = useState(60);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ expiration: string; dossier_id: string } | null>(null);

  if (user && !["AMBULANCIER", "MEDECIN_GENERAL", "MEDECIN_SPECIALISTE", "ADMIN"].includes(user.role)) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  async function handleRecherche(e: { preventDefault(): void }) {
    e.preventDefault();
    setRecherche(true);
    setPatientTrouve(null);
    setPatientNonTrouve(false);
    setFormulaireVisible(false);
    setError("");
    try {
      const res = await apiFetch(`/urgence/recherche/${encodeURIComponent(numeroAssurance.trim())}`);
      if (res.status === 404) { setPatientNonTrouve(true); return; }
      if (!res.ok) throw new Error();
      const data: PatientTrouve = await res.json();
      setPatientTrouve(data);
      setDossierId(data.dossier_id);
      setNumAssuranceSaisie(data.patient.numero_assurance || numeroAssurance);
      setFormulaireVisible(true);
    } catch { setError("Erreur lors de la recherche"); }
    finally { setRecherche(false); }
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!dossierId.trim()) { setError("Identifiant du dossier requis"); return; }
    setSubmitting(true);
    setError("");
    try {
      const res = await apiFetch(`/urgence/dossier/${dossierId.trim()}`, {
        method: "POST",
        body: JSON.stringify({
          raison: raison || "Intervention d'urgence",
          dureeMinutes: duree,
          date_ramassage: datePickup,
          date_arrivee_hopital: dateArrivee,
          numero_assurance: numAssuranceSaisie || undefined,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || "Erreur"); }
      const d = await res.json();
      setSuccess({ expiration: d.expiration, dossier_id: dossierId.trim() });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally { setSubmitting(false); }
  }

  if (success) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Accès d&apos;urgence</h1>
        <div className="mt-6 max-w-lg rounded-xl border border-green-200 bg-green-50 p-6">
          <p className="font-semibold text-green-800">Accès accordé</p>
          <p className="mt-2 text-sm text-green-700">
            Actif jusqu&apos;au <span className="font-medium">{new Date(success.expiration).toLocaleString("fr-CA")}</span>
          </p>
          <p className="mt-2 text-xs text-green-600">
            Référence dossier : {success.dossier_id}
          </p>
        </div>
      </div>
    );
  }

  const hasPrescriptions = patientTrouve && patientTrouve.prescriptions.length > 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Accès d&apos;urgence</h1>
      <p className="mt-1 text-slate-500">Intervention ambulancière — accès temporaire au dossier</p>

      <div className="mt-6 max-w-lg space-y-4">
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
          <svg className="h-5 w-5 shrink-0 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 2L2 22h20L12 2z" />
          </svg>
          <p className="text-sm text-red-700">Cet accès est journalisé. Utilisation à des fins médicales uniquement.</p>
        </div>

        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        {/* Étape 1 — identification */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold text-slate-800">1. Identifier le patient</h2>
          <form onSubmit={handleRecherche} className="flex gap-2">
            <input value={numeroAssurance} onChange={e => setNumeroAssurance(e.target.value)}
              placeholder="Numéro d'assurance maladie"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none" />
            <button type="submit" disabled={recherche || !numeroAssurance.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50">
              {recherche ? "…" : "Rechercher"}
            </button>
          </form>
          {patientNonTrouve && (
            <div className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              <p className="font-medium">Patient non trouvé.</p>
              <button onClick={() => { setPatientNonTrouve(false); setNumAssuranceSaisie(numeroAssurance); setFormulaireVisible(true); }}
                className="mt-1 font-medium text-primary underline">Continuer manuellement</button>
            </div>
          )}
          {patientTrouve && (
            <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3">
              <p className="font-semibold text-green-800">{patientTrouve.patient.prenom} {patientTrouve.patient.nom}</p>
              <p className="text-sm text-green-700">
                Né(e) le {new Date(patientTrouve.patient.date_naissance).toLocaleDateString("fr-CA")}
                {" · "}{patientTrouve.patient.sexe === "HOMME" ? "Homme" : "Femme"}
              </p>
              {hasPrescriptions && (
                <div className="mt-2 border-t border-green-200 pt-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-green-700">Médications</p>
                  <ul className="mt-1">
                    {patientTrouve.prescriptions.flatMap(p =>
                      p.medicaments.map((m, i) => (
                        <li key={`${p.id_prescription}-${i}`} className="text-sm text-green-800">
                          • {m.medicament.nom}{m.medicament.dosage ? ` ${m.medicament.dosage}` : ""}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Étape 2 — formulaire */}
        {formulaireVisible && (
          <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h2 className="font-semibold text-slate-800">2. Détails de l&apos;intervention</h2>

            {!patientTrouve && (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Identifiant du dossier *</label>
                <input value={dossierId} onChange={e => setDossierId(e.target.value)} required placeholder="UUID du dossier"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Raison</label>
              <textarea value={raison} onChange={e => setRaison(e.target.value)} rows={2}
                placeholder="Ex: Douleur thoracique, perte de conscience…"
                className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Date/heure pickup *</label>
                <input type="datetime-local" value={datePickup} onChange={e => setDatePickup(e.target.value)} required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Arrivée hôpital *</label>
                <input type="datetime-local" value={dateArrivee} onChange={e => setDateArrivee(e.target.value)} required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-slate-700">Durée d&apos;accès (min) :</label>
              <input type="number" value={duree} onChange={e => setDuree(Number(e.target.value))} min={15} max={480}
                className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <button type="submit" disabled={submitting}
              className="w-full rounded-lg bg-danger py-2.5 text-sm font-semibold text-white hover:bg-danger-light disabled:opacity-50 transition-colors">
              {submitting ? "Activation…" : "Activer l'accès d'urgence"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
