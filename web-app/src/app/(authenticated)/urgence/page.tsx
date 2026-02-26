"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import EtablissementAutocomplete from "@/components/ui/etablissement-autocomplete";

// ── Types ──────────────────────────────────────────────────────────────────────

interface PatientTrouve {
  dossier_id: string;
  patient: {
    nom: string;
    prenom: string;
    date_naissance: string;
    sexe: string;
    numero_assurance: string | null;
    telephone: string | null;
  };
  prescriptions: {
    id_prescription: string;
    medicaments: { medicament: { nom: string; dosage: string | null } }[];
  }[];
}

function toDatetimeLocal(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function UrgencePage() {
  const { user } = useAuth();
  const router = useRouter();

  // ── Étape 1 : Recherche patient ──────────────────────────────────────────
  const [numeroAssurance, setNumeroAssurance] = useState("");
  const [recherche, setRecherche] = useState(false);
  const [patientTrouve, setPatientTrouve] = useState<PatientTrouve | null>(null);
  const [patientNonTrouve, setPatientNonTrouve] = useState(false);
  const [dossierId, setDossierId] = useState("");
  const [formulaireVisible, setFormulaireVisible] = useState(false);

  // ── Étape 2 : Formulaire d'admission ────────────────────────────────────
  const now = new Date();
  const [dateAdmission, setDateAdmission] = useState(toDatetimeLocal(now));
  const [etablissement, setEtablissement] = useState("");
  const [service, setService] = useState("");
  const [motif, setMotif] = useState("");
  const [resume, setResume] = useState("");
  const [medecinTraitant, setMedecinTraitant] = useState("");
  const [dateSortie, setDateSortie] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [admissionCreee, setAdmissionCreee] = useState<{ id_hospitalisation: string; dossier_id: string } | null>(null);

  // Restriction d'accès
  if (user && !["AMBULANCIER", "MEDECIN_GENERAL", "MEDECIN_SPECIALISTE", "ADMIN"].includes(user.role)) {
    router.replace("/dashboard");
    return null;
  }

  async function handleRecherche(e: React.FormEvent<HTMLFormElement>) {
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
      setFormulaireVisible(true);
    } catch {
      setError("Erreur lors de la recherche.");
    } finally {
      setRecherche(false);
    }
  }

  function continuerManuellement() {
    const uuid = crypto.randomUUID();
    setDossierId(uuid);
    setPatientNonTrouve(false);
    setFormulaireVisible(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!dossierId.trim()) { setError("Identifiant du dossier requis."); return; }
    setSubmitting(true);
    setError("");
    try {
      const res = await apiFetch(`/urgence/admission/${dossierId.trim()}`, {
        method: "POST",
        body: JSON.stringify({
          date_admission: dateAdmission,
          etablissement,
          service,
          motif,
          resume,
          medecin_traitant: medecinTraitant || undefined,
          date_sortie: dateSortie || undefined,
          numero_assurance: numeroAssurance.trim() || undefined,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || "Erreur lors de la création."); }
      const data = await res.json();
      setAdmissionCreee({ id_hospitalisation: data.id_hospitalisation, dossier_id: dossierId.trim() });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Écran de succès ──────────────────────────────────────────────────────
  if (admissionCreee) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admission pré-hospitalière</h1>
        <div className="mt-6 max-w-lg rounded-xl border border-green-200 bg-green-50 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
              <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-green-800">Dossier d&apos;admission créé avec succès</p>
              <p className="mt-0.5 text-sm text-green-700">
                L&apos;admission a été enregistrée dans la section Hospitalisations du dossier patient.
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => router.push(`/dossier/${admissionCreee.dossier_id}`)}
              className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
            >
              Voir le dossier patient
            </button>
            <button
              onClick={() => {
                setAdmissionCreee(null);
                setFormulaireVisible(false);
                setPatientTrouve(null);
                setNumeroAssurance("");
                setDossierId("");
                setEtablissement("");
                setService("");
                setMotif("");
                setResume("");
                setMedecinTraitant("");
                setDateSortie("");
                setDateAdmission(toDatetimeLocal(new Date()));
              }}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Nouvelle admission
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Formulaire ───────────────────────────────────────────────────────────
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Admission pré-hospitalière</h1>
      <p className="mt-1 text-slate-500">Formulaire de collecte d&apos;informations avant hospitalisation</p>

      <div className="mt-6 max-w-2xl space-y-4">
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        {/* ── Étape 1 : Recherche patient ─────────────────────────────────── */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold text-slate-800">1. Identifier le patient</h2>
          <form onSubmit={handleRecherche} className="flex gap-2">
            <input
              value={numeroAssurance}
              onChange={(e) => setNumeroAssurance(e.target.value)}
              placeholder="Numéro d'assurance maladie"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
            />
            <button
              type="submit"
              disabled={recherche || !numeroAssurance.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
            >
              {recherche ? "…" : "Rechercher"}
            </button>
          </form>

          {patientNonTrouve && (
            <div className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              <p className="font-medium">Patient non trouvé dans le système.</p>
              <button
                onClick={continuerManuellement}
                className="mt-1 font-medium text-primary underline"
              >
                Continuer manuellement (dossier anonyme)
              </button>
            </div>
          )}

          {patientTrouve && (
            <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3">
              <p className="font-semibold text-green-800">
                {patientTrouve.patient.prenom} {patientTrouve.patient.nom}
              </p>
              <p className="text-sm text-green-700">
                Né(e) le {new Date(patientTrouve.patient.date_naissance).toLocaleDateString("fr-CA")}
                {" · "}{patientTrouve.patient.sexe === "HOMME" ? "Homme" : "Femme"}
                {patientTrouve.patient.telephone && <> · {patientTrouve.patient.telephone}</>}
              </p>
              {patientTrouve.prescriptions.length > 0 && (
                <div className="mt-2 border-t border-green-200 pt-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-green-700">Médications actives</p>
                  <ul className="mt-1 space-y-0.5">
                    {patientTrouve.prescriptions.flatMap((p) =>
                      p.medicaments.map((m, i) => (
                        <li key={`${p.id_prescription}-${i}`} className="text-sm text-green-800">
                          • {m.medicament.nom}{m.medicament.dosage ? ` — ${m.medicament.dosage}` : ""}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Étape 2 : Formulaire d'admission ────────────────────────────── */}
        {formulaireVisible && (
          <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h2 className="font-semibold text-slate-800">2. Informations d&apos;admission</h2>

            {/* Dossier ID manuel (si patient non trouvé) */}
            {!patientTrouve && (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Identifiant du dossier</label>
                <input
                  value={dossierId}
                  onChange={(e) => setDossierId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-xs"
                  readOnly
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Date et heure d&apos;admission <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={dateAdmission}
                  onChange={(e) => setDateAdmission(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Date de sortie prévue</label>
                <input
                  type="date"
                  value={dateSortie}
                  onChange={(e) => setDateSortie(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Établissement hospitalier <span className="text-red-500">*</span>
              </label>
              <EtablissementAutocomplete
                value={etablissement}
                onChange={setEtablissement}
                placeholder="Rechercher un hôpital ou CLSC..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Service / Unité <span className="text-red-500">*</span>
                </label>
                <input
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  required
                  placeholder="Ex. : Urgence, Cardiologie, Chirurgie…"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Médecin responsable</label>
                <input
                  value={medecinTraitant}
                  onChange={(e) => setMedecinTraitant(e.target.value)}
                  placeholder="Nom du médecin (optionnel)"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Motif d&apos;hospitalisation <span className="text-red-500">*</span>
              </label>
              <input
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                required
                placeholder="Ex. : Douleur thoracique, fracture, détresse respiratoire…"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Résumé de l&apos;état du patient <span className="text-red-500">*</span>
              </label>
              <textarea
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                required
                rows={4}
                placeholder="Décrivez l'état du patient, les observations cliniques, les interventions effectuées sur le terrain…"
                className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50 transition-colors"
            >
              {submitting ? "Enregistrement…" : "Créer le dossier d'admission"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
