"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

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

interface SigneVital {
  heure: string;
  etat: string;
  resp: string;
  spo2: string;
  pouls: string;
  o2: string;
  glyc: string;
}

interface RapportData {
  num_autorisation: string;
  code_smpau: string;
  service_pr: string;
  num_evenement_pr: string;
  etat_conscience: string;
  voies_resp: string;
  voies_resp_autre: string;
  respiration: string;
  pouls_type: string;
  niveau_conscience: string;
  conscience_oriente: string;
  nature_cas: string[];
  nature_cas_autre: string;
  antecedents: string[];
  antecedents_autre: string;
  maladies_infectieuses: string;
  allergies_detail: string;
  mecanisme: string[];
  chute_metres: string;
  incarcere: string;
  temps_desincarceration: string;
  ceinture: boolean;
  ballon_deploye: string;
  mecanisme_autre: string;
  sans_particularite: boolean;
  trauma_grid: string[];
  support_sur_lieux_permis: string;
  support_a_distance_heure: string;
  signes_vitaux: SigneVital[];
  aucune_intervention: boolean;
  arret_cardiaque: boolean;
  arret_temoin: string;
  arret_temoin_heure: string;
  arret_rcr_temoin: boolean;
  arret_dea_temoin: boolean;
  arret_dea_temoin_chocs: string;
  arret_rcr_pr_heure: string;
  arret_dea_pr: boolean;
  arret_dea_pr_chocs: string;
  arret_retour_pouls: string;
  voies_aer: string[];
  immobilisations: string[];
  collet_taille: string;
  pansements: boolean;
  pression_directe: boolean;
  pression_indirecte: boolean;
  pression_heure: string;
  intervention_accouchement: boolean;
  acces_refuse: boolean;
  acces_refuse_detail: string;
  med_nitro: boolean;
  med_nitro_heure1: string;
  med_nitro_heure2: string;
  med_epinephrine: boolean;
  med_epinephrine_03: string;
  med_epinephrine_015: string;
  med_glucose: boolean;
  med_glucagon: boolean;
  med_glucagon_05: boolean;
  med_glucagon_1: boolean;
  entreprise_nom: string;
  vehicule: string;
  pr_accompagne: boolean;
  autres_renseignements: string;
}

// ── Constantes ─────────────────────────────────────────────────────────────────

const EMPTY_SIGNE: SigneVital = { heure: "", etat: "", resp: "", spo2: "", pouls: "", o2: "", glyc: "" };

const INIT: RapportData = {
  num_autorisation: "", code_smpau: "", service_pr: "", num_evenement_pr: "",
  etat_conscience: "", voies_resp: "", voies_resp_autre: "", respiration: "", pouls_type: "", niveau_conscience: "", conscience_oriente: "",
  nature_cas: [], nature_cas_autre: "",
  antecedents: [], antecedents_autre: "",
  maladies_infectieuses: "", allergies_detail: "",
  mecanisme: [], chute_metres: "", incarcere: "", temps_desincarceration: "", ceinture: false, ballon_deploye: "", mecanisme_autre: "",
  sans_particularite: false, trauma_grid: [],
  support_sur_lieux_permis: "", support_a_distance_heure: "",
  signes_vitaux: [{ ...EMPTY_SIGNE }, { ...EMPTY_SIGNE }, { ...EMPTY_SIGNE }],
  aucune_intervention: false,
  arret_cardiaque: false, arret_temoin: "", arret_temoin_heure: "", arret_rcr_temoin: false,
  arret_dea_temoin: false, arret_dea_temoin_chocs: "", arret_rcr_pr_heure: "",
  arret_dea_pr: false, arret_dea_pr_chocs: "", arret_retour_pouls: "",
  voies_aer: [], immobilisations: [], collet_taille: "",
  pansements: false, pression_directe: false, pression_indirecte: false, pression_heure: "",
  intervention_accouchement: false, acces_refuse: false, acces_refuse_detail: "",
  med_nitro: false, med_nitro_heure1: "", med_nitro_heure2: "",
  med_epinephrine: false, med_epinephrine_03: "", med_epinephrine_015: "",
  med_glucose: false, med_glucagon: false, med_glucagon_05: false, med_glucagon_1: false,
  entreprise_nom: "", vehicule: "", pr_accompagne: false,
  autres_renseignements: "",
};

const NATURE_CAS_OPTIONS = [
  "Accouchement", "Arrêt card. resp.", "Atteinte état conscience",
  "Brûlure", "Convulsions", "Coup de chaleur", "Diff. respiratoire",
  "Doul. thoracique", "Électrisation/électrocution", "Engelure",
  "Épistaxis", "Femme enceinte en travail", "Pr. diabétiques",
  "Hypothermie", "Intoxication", "Obs. voies resp.", "Prod. dangereux",
  "Réact. allergique", "Submersion", "Traumatisme",
];

const ANTECEDENTS_OPTIONS = [
  "?", "Aucun", "A.V.C.", "Hypertension", "Cardiaque", "Néoplasie",
  "Diabète", "Psychiatrie", "Épilepsie", "Troubles resp.",
];

const TRAUMA_REGIONS = ["Face", "Crâne", "Cou", "Dos", "Thorax", "Abd.", "Extr."];
const TRAUMA_TYPES = ["Brûlure", "Douleur", "Déformation", "Saign./Hémor.", "Lacération", "Plaie pénétrante", "Perte motric./sens.", "Amputation"];
const VOIES_AER_OPTIONS = ["Voies aériennes libérées", "Appareil à suction", "Masque de poche", "Canule ORO", "Canule NASO", "Ballon ventilatoire"];
const IMMO_OPTIONS = ["Collet cervical", "Matelas immobilisateur", "Planche longue", "K.E.D.", "Attelle de fixation"];

// ── Utilitaires ────────────────────────────────────────────────────────────────

function toDatetimeLocal(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

// ── Composants UI ──────────────────────────────────────────────────────────────

function Sec({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
        <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-primary/10 px-1.5 text-xs font-bold text-primary">
          {num}
        </span>
        <span className="font-semibold text-slate-800">{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function CB({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-300 accent-primary" />
      <span className="text-sm text-slate-700">{label}</span>
    </label>
  );
}

function Rad({ name, value, current, label, onChange }: {
  name: string; value: string; current: string; label: string; onChange: (v: string) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-1.5">
      <input type="radio" name={name} value={value} checked={current === value} onChange={() => onChange(value)}
        className="h-4 w-4 border-slate-300 accent-primary" />
      <span className="text-sm text-slate-700">{label}</span>
    </label>
  );
}

// ── Page principale ────────────────────────────────────────────────────────────

type ArrayField = "nature_cas" | "antecedents" | "mecanisme" | "voies_aer" | "immobilisations" | "trauma_grid";

export default function UrgencePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [numeroAssurance, setNumeroAssurance] = useState("");
  const [recherche, setRecherche] = useState(false);
  const [patientTrouve, setPatientTrouve] = useState<PatientTrouve | null>(null);
  const [patientNonTrouve, setPatientNonTrouve] = useState(false);
  const [dossierId, setDossierId] = useState("");
  const [formulaireVisible, setFormulaireVisible] = useState(false);

  const now = new Date();
  const [datePickup, setDatePickup] = useState(toDatetimeLocal(now));
  const [dateArrivee, setDateArrivee] = useState(toDatetimeLocal(now));
  const [carteHopital, setCarteHopital] = useState("");
  const [numAssuranceSaisie, setNumAssuranceSaisie] = useState("");
  const [duree, setDuree] = useState(60);

  const [rapport, setRapport] = useState<RapportData>(INIT);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ expiration: string; dossier_id: string } | null>(null);

  if (user && !["AMBULANCIER", "MEDECIN_GENERAL", "MEDECIN_SPECIALISTE", "ADMIN"].includes(user.role)) {
    router.replace("/dashboard");
    return null;
  }

  const setR = <K extends keyof RapportData>(k: K, v: RapportData[K]) =>
    setRapport(p => ({ ...p, [k]: v }));

  const toggle = (field: ArrayField, val: string) =>
    setRapport(p => {
      const arr = p[field] as string[];
      return { ...p, [field]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] };
    });

  const updateSigne = (i: number, field: keyof SigneVital, val: string) =>
    setRapport(p => {
      const sv = [...p.signes_vitaux];
      sv[i] = { ...sv[i], [field]: val };
      return { ...p, signes_vitaux: sv };
    });

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

  function handleContinuerSansPatient() {
    setPatientNonTrouve(false);
    setNumAssuranceSaisie(numeroAssurance);
    setFormulaireVisible(true);
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!dossierId.trim()) { setError("Identifiant du dossier requis"); return; }
    setSubmitting(true);
    setError("");
    const raison = rapport.nature_cas.length > 0
      ? rapport.nature_cas.join(", ") + (rapport.nature_cas_autre ? ", " + rapport.nature_cas_autre : "")
      : rapport.autres_renseignements || "Intervention d'urgence";
    try {
      const res = await apiFetch(`/urgence/dossier/${dossierId.trim()}`, {
        method: "POST",
        body: JSON.stringify({
          raison,
          dureeMinutes: duree,
          date_ramassage: datePickup,
          date_arrivee_hopital: dateArrivee,
          carte_hopital: carteHopital || undefined,
          numero_assurance: numAssuranceSaisie || undefined,
          rapport_data: rapport,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || "Erreur"); }
      const d = await res.json();
      setSuccess({ expiration: d.expiration, dossier_id: dossierId.trim() });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally { setSubmitting(false); }
  }

  // ── Succès ─────────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Accès d&apos;urgence</h1>
        <div className="mt-6 max-w-lg rounded-xl border border-green-200 bg-green-50 p-6">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <h3 className="font-semibold text-green-800">Accès accordé</h3>
          </div>
          <p className="mt-2 text-sm text-green-700">
            L&apos;accès est actif jusqu&apos;au{" "}
            <span className="font-medium">{new Date(success.expiration).toLocaleString("fr-CA")}</span>
          </p>
          <button onClick={() => router.push(`/dossier/${success.dossier_id}`)}
            className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-light">
            Voir le dossier
          </button>
        </div>
      </div>
    );
  }

  const hasPrescriptions = patientTrouve && patientTrouve.prescriptions.length > 0;

  // ── Rendu ──────────────────────────────────────────────────────────────────
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Accès d&apos;urgence</h1>
      <p className="mt-1 text-slate-500">Rapport d&apos;intervention préhospitalière — premier répondant</p>

      <div className="mt-6 max-w-2xl space-y-4">
        {/* Avertissement légal */}
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
          <svg className="h-5 w-5 shrink-0 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 2L2 22h20L12 2z" />
          </svg>
          <p className="text-sm text-red-700">Cet accès est journalisé. Utilisation à des fins médicales uniquement.</p>
        </div>

        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        {/* ── Étape 1 : Identification ── */}
        <Sec num="1" title="Identification de l'usager">
          <form onSubmit={handleRecherche} className="flex gap-2">
            <input
              value={numeroAssurance}
              onChange={e => setNumeroAssurance(e.target.value)}
              placeholder="Numéro d'assurance maladie"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none"
            />
            <button type="submit" disabled={recherche || !numeroAssurance.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50">
              {recherche ? "…" : "Rechercher"}
            </button>
          </form>

          {patientNonTrouve && (
            <div className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              <p className="font-medium">Patient non trouvé dans le système.</p>
              <button onClick={handleContinuerSansPatient} className="mt-1 font-medium text-primary underline">
                Continuer manuellement
              </button>
            </div>
          )}

          {patientTrouve && (
            <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3">
              <p className="font-semibold text-green-800">{patientTrouve.patient.prenom} {patientTrouve.patient.nom}</p>
              <p className="text-sm text-green-700">
                Né(e) le {new Date(patientTrouve.patient.date_naissance).toLocaleDateString("fr-CA")}
                {" · "}{patientTrouve.patient.sexe === "HOMME" ? "Homme" : "Femme"}
                {patientTrouve.patient.telephone && ` · ${patientTrouve.patient.telephone}`}
              </p>
              {hasPrescriptions && (
                <div className="mt-2 border-t border-green-200 pt-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-green-700">Médications enregistrées</p>
                  <ul className="mt-1 space-y-0.5">
                    {patientTrouve.prescriptions.flatMap((p) =>
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
        </Sec>

        {/* ── Étape 2 : Formulaire complet ── */}
        {formulaireVisible && (
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* ── 1-3 Prise en charge & Arrivée ── */}
            <Sec num="1–3" title="Prise en charge · Arrivée">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Date/heure — prise en charge *</label>
                  <input type="datetime-local" value={datePickup} onChange={e => setDatePickup(e.target.value)} required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Heure d&apos;arrivée à l&apos;hôpital *</label>
                  <input type="datetime-local" value={dateArrivee} onChange={e => setDateArrivee(e.target.value)} required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">N° d&apos;autorisation</label>
                  <input value={rapport.num_autorisation} onChange={e => setR("num_autorisation", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Code SMPAU</label>
                  <input value={rapport.code_smpau} onChange={e => setR("code_smpau", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Service PR</label>
                  <input value={rapport.service_pr} onChange={e => setR("service_pr", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">N° événement PR</label>
                  <input value={rapport.num_evenement_pr} onChange={e => setR("num_evenement_pr", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                </div>
                {!patientTrouve && (
                  <div className="col-span-2">
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Identifiant du dossier *</label>
                    <input value={dossierId} onChange={e => setDossierId(e.target.value)} required placeholder="UUID du dossier"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                  </div>
                )}
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">N° assurance maladie</label>
                  <input value={numAssuranceSaisie} onChange={e => setNumAssuranceSaisie(e.target.value)} placeholder="Ex: GAGL58031201"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Carte hôpital</label>
                  <input value={carteHopital} onChange={e => setCarteHopital(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                </div>
              </div>
            </Sec>

            {/* ── 4 Approche initiale ── */}
            <Sec num="4" title="Approche initiale">
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700"><span className="font-bold">L&apos;</span> État de conscience</p>
                  <div className="flex gap-6">
                    <Rad name="etat_conscience" value="reaction" current={rapport.etat_conscience} label="Réaction" onChange={v => setR("etat_conscience", v)} />
                    <Rad name="etat_conscience" value="aucune_reaction" current={rapport.etat_conscience} label="Ø Réaction" onChange={v => setR("etat_conscience", v)} />
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700"><span className="font-bold">A</span> Voies respiratoires</p>
                  <div className="flex flex-wrap gap-4">
                    <Rad name="voies_resp" value="libres" current={rapport.voies_resp} label="Libres" onChange={v => setR("voies_resp", v)} />
                    <Rad name="voies_resp" value="obstruees_corps" current={rapport.voies_resp} label="Obstruées — corps étranger" onChange={v => setR("voies_resp", v)} />
                    <Rad name="voies_resp" value="obstruees_autre" current={rapport.voies_resp} label="Obstruées (autre)" onChange={v => setR("voies_resp", v)} />
                  </div>
                  {rapport.voies_resp === "obstruees_autre" && (
                    <input value={rapport.voies_resp_autre} onChange={e => setR("voies_resp_autre", e.target.value)} placeholder="Préciser"
                      className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
                  )}
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700"><span className="font-bold">B</span> Respiration</p>
                  <div className="flex flex-wrap gap-4">
                    {[["adequate", "Adéquate"], ["inadequate", "Inadéquate (tirage, bruits…)"], ["hypoventilation", "Hypoventilation (<8/min)"], ["absente", "Absente"]].map(([v, l]) => (
                      <Rad key={v} name="respiration" value={v} current={rapport.respiration} label={l} onChange={val => setR("respiration", val)} />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700"><span className="font-bold">C</span> Pouls</p>
                  <div className="flex flex-wrap gap-4">
                    <Rad name="pouls_type" value="carotidien" current={rapport.pouls_type} label="Présent → Carotidien" onChange={v => setR("pouls_type", v)} />
                    <Rad name="pouls_type" value="radial" current={rapport.pouls_type} label="Présent → Radial" onChange={v => setR("pouls_type", v)} />
                    <Rad name="pouls_type" value="absent" current={rapport.pouls_type} label="Absent" onChange={v => setR("pouls_type", v)} />
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700"><span className="font-bold">D</span> Niveau de conscience</p>
                  <div className="flex flex-wrap gap-4">
                    {[["A", "A — Alerte"], ["V", "V — Stimuli verbal"], ["P", "P — Stimuli douleur"], ["U", "U — Ø Réaction"]].map(([v, l]) => (
                      <Rad key={v} name="niveau_conscience" value={v} current={rapport.niveau_conscience} label={l} onChange={val => setR("niveau_conscience", val)} />
                    ))}
                  </div>
                  {rapport.niveau_conscience === "V" && (
                    <div className="mt-2 flex items-center gap-4">
                      <span className="text-sm text-slate-600">Orienté :</span>
                      <Rad name="conscience_oriente" value="oui" current={rapport.conscience_oriente} label="Oui" onChange={v => setR("conscience_oriente", v)} />
                      <Rad name="conscience_oriente" value="non" current={rapport.conscience_oriente} label="Non" onChange={v => setR("conscience_oriente", v)} />
                    </div>
                  )}
                </div>
              </div>
            </Sec>

            {/* ── 5 Nature du cas ── */}
            <Sec num="5" title="Nature du cas">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {NATURE_CAS_OPTIONS.map(opt => (
                  <CB key={opt} label={opt} checked={rapport.nature_cas.includes(opt)} onChange={() => toggle("nature_cas", opt)} />
                ))}
              </div>
              <input value={rapport.nature_cas_autre} onChange={e => setR("nature_cas_autre", e.target.value)}
                placeholder="Autre : préciser"
                className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
            </Sec>

            {/* ── 6-8 Antécédents · Maladies · Allergies ── */}
            <Sec num="6–8" title="Antécédents médicaux · Maladies infectieuses · Allergies">
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">6 — Antécédents médicaux</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {ANTECEDENTS_OPTIONS.map(opt => (
                      <CB key={opt} label={opt} checked={rapport.antecedents.includes(opt)} onChange={() => toggle("antecedents", opt)} />
                    ))}
                  </div>
                  <input value={rapport.antecedents_autre} onChange={e => setR("antecedents_autre", e.target.value)}
                    placeholder="Autre antécédent"
                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">7 — Maladies infectieuses</p>
                    <input value={rapport.maladies_infectieuses} onChange={e => setR("maladies_infectieuses", e.target.value)}
                      placeholder="Préciser si applicable"
                      className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">8 — Allergies</p>
                    <input value={rapport.allergies_detail} onChange={e => setR("allergies_detail", e.target.value)}
                      placeholder="Préciser si applicable"
                      className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
                  </div>
                </div>
              </div>
            </Sec>

            {/* ── 9 Mécanisme du traumatisme ── */}
            <Sec num="9" title="Mécanisme du traumatisme">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {["Auto", "Moto", "Piéton", "Cycliste", "Chute", "Arme blanche", "Arme à feu", "Bagarre"].map(opt => (
                  <CB key={opt} label={opt} checked={rapport.mecanisme.includes(opt)} onChange={() => toggle("mecanisme", opt)} />
                ))}
              </div>
              <div className="mt-3 space-y-3">
                {rapport.mecanisme.includes("Auto") && (
                  <div className="flex flex-wrap items-center gap-4 rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <CB label="Ceinture" checked={rapport.ceinture} onChange={v => setR("ceinture", v)} />
                    <span className="text-sm text-slate-500">Ballon déployé :</span>
                    {["oui", "non", "?"].map(v => (
                      <Rad key={v} name="ballon_deploye" value={v} current={rapport.ballon_deploye} label={v === "?" ? "?" : v.charAt(0).toUpperCase() + v.slice(1)} onChange={val => setR("ballon_deploye", val)} />
                    ))}
                  </div>
                )}
                {rapport.mecanisme.includes("Chute") && (
                  <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-500">Hauteur (mètres)</label>
                      <input value={rapport.chute_metres} onChange={e => setR("chute_metres", e.target.value)} type="number" min="0"
                        className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-500">Incarcéré</label>
                      <div className="flex gap-3">
                        {["oui", "non", "?"].map(v => (
                          <Rad key={v} name="incarcere" value={v} current={rapport.incarcere} label={v === "?" ? "?" : v.charAt(0).toUpperCase() + v.slice(1)} onChange={val => setR("incarcere", val)} />
                        ))}
                      </div>
                    </div>
                    {rapport.incarcere === "oui" && (
                      <div className="col-span-2">
                        <label className="mb-1 block text-xs font-medium text-slate-500">Temps de désincarcération</label>
                        <input value={rapport.temps_desincarceration} onChange={e => setR("temps_desincarceration", e.target.value)} placeholder="Ex : 45 min"
                          className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
                      </div>
                    )}
                  </div>
                )}
                <input value={rapport.mecanisme_autre} onChange={e => setR("mecanisme_autre", e.target.value)}
                  placeholder="Autre mécanisme : préciser"
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
              </div>
            </Sec>

            {/* ── 10 Approche objective ── */}
            <Sec num="10" title="Approche objective du traumatisé">
              <CB label="Sans particularité" checked={rapport.sans_particularite} onChange={v => setR("sans_particularite", v)} />
              {!rapport.sans_particularite && (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr>
                        <th className="pb-1 pr-2 text-left font-medium text-slate-400"></th>
                        {TRAUMA_REGIONS.map(r => (
                          <th key={r} className="px-1 pb-1 text-center font-medium text-slate-500">{r}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {TRAUMA_TYPES.map(type => (
                        <tr key={type} className="border-t border-slate-100">
                          <td className="whitespace-nowrap py-1 pr-2 text-slate-700">{type}</td>
                          {TRAUMA_REGIONS.map(region => {
                            const key = `${type}|${region}`;
                            return (
                              <td key={region} className="px-1 py-1 text-center">
                                <input type="checkbox" checked={rapport.trauma_grid.includes(key)}
                                  onChange={() => toggle("trauma_grid", key)}
                                  className="h-4 w-4 rounded border-slate-300 accent-primary" />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Sec>

            {/* ── 11 Support clinique ── */}
            <Sec num="11" title="Support clinique">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <CB label="Sur les lieux" checked={rapport.support_sur_lieux_permis !== ""}
                    onChange={v => setR("support_sur_lieux_permis", v ? " " : "")} />
                  {rapport.support_sur_lieux_permis !== "" && (
                    <input value={rapport.support_sur_lieux_permis.trim()}
                      onChange={e => setR("support_sur_lieux_permis", e.target.value || " ")}
                      placeholder="N° permis"
                      className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
                  )}
                </div>
                <div>
                  <CB label="À distance" checked={rapport.support_a_distance_heure !== ""}
                    onChange={v => setR("support_a_distance_heure", v ? " " : "")} />
                  {rapport.support_a_distance_heure !== "" && (
                    <input type="time" value={rapport.support_a_distance_heure.trim()}
                      onChange={e => setR("support_a_distance_heure", e.target.value || " ")}
                      className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
                  )}
                </div>
              </div>
            </Sec>

            {/* ── 12 Signes vitaux ── */}
            <Sec num="12" title="Signes vitaux">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      <th className="pb-2 text-left">Heure</th>
                      <th className="px-1 pb-2 text-center">État</th>
                      <th className="px-1 pb-2 text-center">Resp./min</th>
                      <th className="px-1 pb-2 text-center">SpO₂ %</th>
                      <th className="px-1 pb-2 text-center">Pouls/min</th>
                      <th className="px-1 pb-2 text-center">O₂</th>
                      <th className="px-1 pb-2 text-center">Glyc. cap.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rapport.signes_vitaux.map((sv, i) => (
                      <tr key={i} className="border-t border-slate-100">
                        <td className="py-1 pr-1">
                          <input type="time" value={sv.heure} onChange={e => updateSigne(i, "heure", e.target.value)}
                            className="w-full rounded border border-slate-300 px-2 py-1 text-sm" />
                        </td>
                        <td className="px-1 py-1">
                          <select value={sv.etat} onChange={e => updateSigne(i, "etat", e.target.value)}
                            className="w-full rounded border border-slate-300 px-1 py-1 text-sm">
                            <option value="">-</option>
                            {["A", "V", "P", "U"].map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                        </td>
                        {(["resp", "spo2", "pouls", "o2", "glyc"] as (keyof SigneVital)[]).map(field => (
                          <td key={field} className="px-1 py-1">
                            <input value={sv[field]} onChange={e => updateSigne(i, field, e.target.value)}
                              placeholder="—"
                              className="w-full rounded border border-slate-300 px-2 py-1 text-sm" />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Sec>

            {/* ── 13 Interventions ── */}
            <Sec num="13" title="Interventions">
              <div className="space-y-4">
                <CB label="Aucune intervention" checked={rapport.aucune_intervention} onChange={v => setR("aucune_intervention", v)} />

                {!rapport.aucune_intervention && (
                  <>
                    {/* Arrêt cardiaque */}
                    <div className="rounded-lg border border-slate-100 p-3">
                      <CB label="Arrêt cardiaque" checked={rapport.arret_cardiaque} onChange={v => setR("arret_cardiaque", v)} />
                      {rapport.arret_cardiaque && (
                        <div className="mt-3 space-y-3 pl-5">
                          <div>
                            <p className="mb-1 text-sm text-slate-600">Témoin de l&apos;effondrement (VU/ENTENDU)</p>
                            <div className="flex flex-wrap gap-4">
                              <Rad name="arret_temoin" value="vu" current={rapport.arret_temoin} label="Vu" onChange={v => setR("arret_temoin", v)} />
                              <Rad name="arret_temoin" value="entendu" current={rapport.arret_temoin} label="Entendu" onChange={v => setR("arret_temoin", v)} />
                              <Rad name="arret_temoin" value="non" current={rapport.arret_temoin} label="Non / ?" onChange={v => setR("arret_temoin", v)} />
                            </div>
                            {(rapport.arret_temoin === "vu" || rapport.arret_temoin === "entendu") && (
                              <input type="time" value={rapport.arret_temoin_heure} onChange={e => setR("arret_temoin_heure", e.target.value)}
                                className="mt-2 rounded-lg border border-slate-300 px-3 py-1 text-sm" placeholder="Heure" />
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <CB label="R.C.R. témoin" checked={rapport.arret_rcr_temoin} onChange={v => setR("arret_rcr_temoin", v)} />
                              <div>
                                <CB label="DEA témoin" checked={rapport.arret_dea_temoin} onChange={v => setR("arret_dea_temoin", v)} />
                                {rapport.arret_dea_temoin && (
                                  <input value={rapport.arret_dea_temoin_chocs} onChange={e => setR("arret_dea_temoin_chocs", e.target.value)}
                                    placeholder="Nbre chocs"
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1 text-sm" />
                                )}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <p className="mb-1 text-sm font-medium text-slate-700">R.C.R. Premier répondant</p>
                                <input type="time" value={rapport.arret_rcr_pr_heure} onChange={e => setR("arret_rcr_pr_heure", e.target.value)}
                                  className="w-full rounded-lg border border-slate-300 px-3 py-1 text-sm" />
                              </div>
                              <div>
                                <CB label="DEA Premier répondant" checked={rapport.arret_dea_pr} onChange={v => setR("arret_dea_pr", v)} />
                                {rapport.arret_dea_pr && (
                                  <input value={rapport.arret_dea_pr_chocs} onChange={e => setR("arret_dea_pr_chocs", e.target.value)}
                                    placeholder="Nbre chocs"
                                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1 text-sm" />
                                )}
                              </div>
                            </div>
                          </div>
                          <div>
                            <p className="mb-1 text-sm text-slate-600">Retour de pouls avant la prise en charge par les TAP</p>
                            <div className="flex gap-4">
                              <Rad name="retour_pouls" value="oui" current={rapport.arret_retour_pouls} label="Oui" onChange={v => setR("arret_retour_pouls", v)} />
                              <Rad name="retour_pouls" value="non" current={rapport.arret_retour_pouls} label="Non" onChange={v => setR("arret_retour_pouls", v)} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Voies aériennes */}
                    <div className="rounded-lg border border-slate-100 p-3">
                      <p className="mb-2 text-sm font-semibold text-slate-700">Voies aériennes</p>
                      <div className="grid grid-cols-2 gap-2">
                        {VOIES_AER_OPTIONS.map(opt => (
                          <CB key={opt} label={opt} checked={rapport.voies_aer.includes(opt)} onChange={() => toggle("voies_aer", opt)} />
                        ))}
                      </div>
                    </div>

                    {/* Immobilisations */}
                    <div className="rounded-lg border border-slate-100 p-3">
                      <p className="mb-2 text-sm font-semibold text-slate-700">Immobilisations</p>
                      <div className="grid grid-cols-2 gap-2">
                        {IMMO_OPTIONS.map(opt => (
                          <CB key={opt} label={opt} checked={rapport.immobilisations.includes(opt)} onChange={() => toggle("immobilisations", opt)} />
                        ))}
                      </div>
                      {rapport.immobilisations.includes("Collet cervical") && (
                        <div className="mt-2 flex flex-wrap items-center gap-3">
                          <span className="text-sm text-slate-600">Taille :</span>
                          {["Péd.", "N.N.", "P", "M", "G"].map(t => (
                            <Rad key={t} name="collet_taille" value={t} current={rapport.collet_taille} label={t} onChange={v => setR("collet_taille", v)} />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Hémorragies */}
                    <div className="rounded-lg border border-slate-100 p-3">
                      <p className="mb-2 text-sm font-semibold text-slate-700">Hémorragies</p>
                      <CB label="Pansements" checked={rapport.pansements} onChange={v => setR("pansements", v)} />
                      <div className="mt-2 flex flex-wrap items-center gap-4">
                        <span className="text-sm text-slate-600">Contrôle par pression :</span>
                        <CB label="Directe" checked={rapport.pression_directe} onChange={v => setR("pression_directe", v)} />
                        <CB label="Indirecte" checked={rapport.pression_indirecte} onChange={v => setR("pression_indirecte", v)} />
                        {(rapport.pression_directe || rapport.pression_indirecte) && (
                          <input type="time" value={rapport.pression_heure} onChange={e => setR("pression_heure", e.target.value)}
                            className="rounded-lg border border-slate-300 px-3 py-1 text-sm" />
                        )}
                      </div>
                    </div>

                    {/* Autres */}
                    <div className="flex flex-wrap gap-4">
                      <CB label="Accouchement" checked={rapport.intervention_accouchement} onChange={v => setR("intervention_accouchement", v)} />
                      <CB label="Accès refusé" checked={rapport.acces_refuse} onChange={v => setR("acces_refuse", v)} />
                    </div>
                    {rapport.acces_refuse && (
                      <input value={rapport.acces_refuse_detail} onChange={e => setR("acces_refuse_detail", e.target.value)}
                        placeholder="Préciser la raison du refus"
                        className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
                    )}
                  </>
                )}
              </div>
            </Sec>

            {/* ── 13A Médicaments ── */}
            <Sec num="13A" title="Médicaments administrés">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <CB label="Prise de nitro par l'usager" checked={rapport.med_nitro} onChange={v => setR("med_nitro", v)} />
                  {rapport.med_nitro && (
                    <>
                      <input type="time" value={rapport.med_nitro_heure1} onChange={e => setR("med_nitro_heure1", e.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-1 text-sm" />
                      <input type="time" value={rapport.med_nitro_heure2} onChange={e => setR("med_nitro_heure2", e.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-1 text-sm" />
                    </>
                  )}
                </div>
                <div>
                  <CB label="Administration d'épinéphrine" checked={rapport.med_epinephrine} onChange={v => setR("med_epinephrine", v)} />
                  {rapport.med_epinephrine && (
                    <div className="mt-2 space-y-2 pl-6">
                      <div className="flex items-center gap-3">
                        <CB label="0,3 mg" checked={rapport.med_epinephrine_03 !== ""} onChange={v => setR("med_epinephrine_03", v ? " " : "")} />
                        {rapport.med_epinephrine_03 !== "" && (
                          <input type="time" value={rapport.med_epinephrine_03.trim()} onChange={e => setR("med_epinephrine_03", e.target.value || " ")}
                            className="rounded-lg border border-slate-300 px-3 py-1 text-sm" />
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <CB label="0,15 mg" checked={rapport.med_epinephrine_015 !== ""} onChange={v => setR("med_epinephrine_015", v ? " " : "")} />
                        {rapport.med_epinephrine_015 !== "" && (
                          <input type="time" value={rapport.med_epinephrine_015.trim()} onChange={e => setR("med_epinephrine_015", e.target.value || " ")}
                            className="rounded-lg border border-slate-300 px-3 py-1 text-sm" />
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <CB label="Glucose en gel ou jus sucré" checked={rapport.med_glucose} onChange={v => setR("med_glucose", v)} />
                <div>
                  <CB label="Glucagon" checked={rapport.med_glucagon} onChange={v => setR("med_glucagon", v)} />
                  {rapport.med_glucagon && (
                    <div className="mt-2 flex gap-4 pl-6">
                      <CB label="0,5 mg" checked={rapport.med_glucagon_05} onChange={v => setR("med_glucagon_05", v)} />
                      <CB label="1 mg" checked={rapport.med_glucagon_1} onChange={v => setR("med_glucagon_1", v)} />
                    </div>
                  )}
                </div>
              </div>
            </Sec>

            {/* ── 14 Entreprise ambulancière ── */}
            <Sec num="14" title="Entreprise ambulancière">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Nom</label>
                  <input value={rapport.entreprise_nom} onChange={e => setR("entreprise_nom", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">Véhicule</label>
                  <input value={rapport.vehicule} onChange={e => setR("vehicule", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                </div>
                <div className="col-span-2">
                  <CB label="PR accompagne" checked={rapport.pr_accompagne} onChange={v => setR("pr_accompagne", v)} />
                </div>
              </div>
            </Sec>

            {/* ── 15 Autres renseignements ── */}
            <Sec num="15" title="Autres renseignements pertinents">
              <textarea
                value={rapport.autres_renseignements}
                onChange={e => setR("autres_renseignements", e.target.value)}
                rows={4}
                placeholder="Informations complémentaires…"
                className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none"
              />
            </Sec>

            {/* Durée d'accès */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <label className="text-sm font-medium text-slate-700">Durée d&apos;accès au dossier (minutes) :</label>
              <input type="number" value={duree} onChange={e => setDuree(Number(e.target.value))} min={15} max={480}
                className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>

            <button type="submit" disabled={submitting}
              className="w-full rounded-lg bg-danger py-3 text-sm font-semibold text-white transition-colors hover:bg-danger-light disabled:opacity-50">
              {submitting ? "Activation en cours…" : "Activer l'accès d'urgence"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
