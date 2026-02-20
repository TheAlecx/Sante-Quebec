import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth-context";
import { apiFetch } from "../lib/api";
import { canAddConsultation, canAddObservation, canAddPrescription, canModify } from "../lib/roles";

type Tab = "profil" | "consultations" | "observations" | "prescriptions" | "hospitalisations";

const TABS: { key: Tab; label: string }[] = [
  { key: "profil", label: "Profil" },
  { key: "consultations", label: "Consultations" },
  { key: "observations", label: "Observations" },
  { key: "prescriptions", label: "Prescriptions" },
  { key: "hospitalisations", label: "Hospitalisations" },
];

// ─── Types ───────────────────────────────────────────────────────────────────

interface PatientData {
  id_patient: string;
  nom: string; prenom: string;
  date_naissance: string;
  sexe: string;
  numero_assurance: string | null;
  telephone: string | null;
  adresse: string | null;
  taille_cm: number | null;
  poids_kg: number | null;
  contact_urgence_nom: string | null;
  contact_urgence_telephone: string | null;
  contact_urgence_lien: string | null;
  pharmacie_nom: string | null;
  pharmacie_telephone: string | null;
  pharmacie_adresse: string | null;
  medecin_traitant: { id_utilisateur: string; nom: string; prenom: string; role: string; institution: string | null } | null;
}

interface Consultation {
  id_consultation: string;
  motif: string;
  diagnostic: string | null;
  date: string;
  notes: string | null;
}

interface Observation {
  id_observation: string;
  contenu: string;
  date: string;
  auteur?: { nom: string; prenom: string };
}

interface Prescription {
  id_prescription: string;
  date: string;
  medicaments: { medicament: { nom: string; dosage: string | null }; posologie: string | null; duree_jours: number | null }[];
}

interface Hospitalisation {
  id_hospitalisation: string;
  date_admission: string;
  date_sortie: string | null;
  motif: string;
  etablissement: string | null;
  notes: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getAge(d: string) {
  const birth = new Date(d);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString("fr-CA", { year: "numeric", month: "long", day: "numeric" });
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DossierPage() {
  const { id: dossierId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("profil");

  const canEdit = user ? canModify(user.role) : false;
  const peutRefer = user?.role === "MEDECIN_GENERAL";

  // ── Référence spécialiste ──────────────────────────────────────────────────
  const [referModal, setReferModal] = useState(false);
  const [specialistes, setSpecialistes] = useState<{ id_utilisateur: string; nom: string; prenom: string; institution: string | null; role?: string }[]>([]);
  const [loadingSpec, setLoadingSpec] = useState(false);
  const [selectedSpec, setSelectedSpec] = useState("");
  const [motifRefer, setMotifRefer] = useState("");
  const [referEnvoyee, setReferEnvoyee] = useState(false);

  async function ouvrirReferModal() {
    setSelectedSpec(""); setMotifRefer(""); setReferEnvoyee(false);
    setReferModal(true); setLoadingSpec(true);
    try {
      const res = await apiFetch("/medecins");
      if (res.ok) {
        const data = await res.json();
        setSpecialistes(data.filter((m: { role?: string }) => m.role === "MEDECIN_SPECIALISTE"));
      }
    } finally { setLoadingSpec(false); }
  }

  if (!dossierId) return null;

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <button onClick={() => navigate("/patients")} className="mb-2 flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Patients
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Dossier médical</h1>
          <p className="mt-1 text-xs text-slate-400">ID : {dossierId}</p>
        </div>
        {peutRefer && (
          <button onClick={ouvrirReferModal}
            className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Référer à un spécialiste
          </button>
        )}
      </div>

      <div className="mt-6 border-b border-slate-200">
        <nav className="flex gap-6">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`border-b-2 pb-3 text-sm font-medium transition-colors ${activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === "profil" && <ProfileTab dossierId={dossierId} canEdit={canEdit} />}
        {activeTab === "consultations" && <ConsultationsTab dossierId={dossierId} canEdit={canEdit} />}
        {activeTab === "observations" && <ObservationsTab dossierId={dossierId} canEdit={canEdit} />}
        {activeTab === "prescriptions" && <PrescriptionsTab dossierId={dossierId} canEdit={canEdit} />}
        {activeTab === "hospitalisations" && <HospitalisationsTab dossierId={dossierId} canEdit={canEdit} />}
      </div>

      {/* Modal référence */}
      {referModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Référer à un spécialiste</h2>
              <button onClick={() => setReferModal(false)} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5">
              {referEnvoyee ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                      <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-green-800">Référence envoyée</p>
                      <p className="mt-0.5 text-sm text-green-700">
                        {(() => {
                          const s = specialistes.find(x => x.id_utilisateur === selectedSpec);
                          return s ? `Référé à Dre ${s.prenom} ${s.nom}${s.institution ? ` (${s.institution})` : ""}` : "";
                        })()}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setReferModal(false)}
                    className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-dark">
                    Fermer
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Médecin spécialiste *</label>
                    {loadingSpec ? (
                      <p className="text-sm text-slate-400">Chargement…</p>
                    ) : specialistes.length === 0 ? (
                      <p className="text-sm italic text-slate-400">Aucun spécialiste disponible.</p>
                    ) : (
                      <select value={selectedSpec} onChange={e => setSelectedSpec(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none">
                        <option value="">— Sélectionner —</option>
                        {specialistes.map(s => (
                          <option key={s.id_utilisateur} value={s.id_utilisateur}>
                            Dre {s.prenom} {s.nom}{s.institution ? ` · ${s.institution}` : ""}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Motif</label>
                    <textarea value={motifRefer} onChange={e => setMotifRefer(e.target.value)} rows={3} resize-none
                      placeholder="Ex. : Suivi cardiologique…"
                      className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setReferEnvoyee(true)} disabled={!selectedSpec}
                      className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-40">
                      Envoyer
                    </button>
                    <button onClick={() => setReferModal(false)}
                      className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Profil ──────────────────────────────────────────────────────────────

function ProfileTab({ dossierId, canEdit }: { dossierId: string; canEdit: boolean }) {
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  async function fetch() {
    setLoading(true); setError("");
    try {
      const res = await apiFetch(`/patients/dossier/${dossierId}`);
      if (!res.ok) throw new Error("Erreur chargement");
      setPatient(await res.json());
    } catch { setError("Impossible de charger le profil."); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetch(); }, [dossierId]);

  async function saveEdit(field: string) {
    if (!patient) return;
    setSaving(true);
    try {
      const res = await apiFetch(`/patients/dossier/${dossierId}`, {
        method: "PUT", body: JSON.stringify({ [field]: editValue }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setPatient({ ...updated, medecin_traitant: patient.medecin_traitant });
      setEditingField(null);
    } catch { /* keep editing */ }
    finally { setSaving(false); }
  }

  if (loading) return <Spinner />;
  if (error) return <ErrMsg msg={error} onRetry={fetch} />;
  if (!patient) return null;

  const bmi = patient.taille_cm && patient.poids_kg
    ? (patient.poids_kg / Math.pow(patient.taille_cm / 100, 2)).toFixed(1) : null;

  const rows: { label: string; field: string; display: string; raw?: string; editable: boolean }[] = [
    { label: "Nom", field: "nom", display: patient.nom, raw: patient.nom, editable: true },
    { label: "Prénom", field: "prenom", display: patient.prenom, raw: patient.prenom, editable: true },
    { label: "Date de naissance", field: "", display: fmt(patient.date_naissance), editable: false },
    { label: "Âge", field: "", display: `${getAge(patient.date_naissance)} ans`, editable: false },
    { label: "Sexe", field: "", display: patient.sexe === "HOMME" ? "Homme" : "Femme", editable: false },
    { label: "N° Assurance maladie", field: "numero_assurance", display: patient.numero_assurance || "—", raw: patient.numero_assurance || "", editable: true },
    { label: "Téléphone", field: "telephone", display: patient.telephone || "—", raw: patient.telephone || "", editable: true },
    { label: "Adresse", field: "adresse", display: patient.adresse || "—", raw: patient.adresse || "", editable: true },
    { label: "Taille", field: "taille_cm", display: patient.taille_cm ? `${patient.taille_cm} cm` : "—", raw: patient.taille_cm?.toString() || "", editable: true },
    { label: "Poids", field: "poids_kg", display: patient.poids_kg ? `${patient.poids_kg} kg` : "—", raw: patient.poids_kg?.toString() || "", editable: true },
    { label: "IMC", field: "", display: bmi ? `${bmi} kg/m²` : "—", editable: false },
  ];

  const urgRows: { label: string; field: string; display: string; raw: string }[] = [
    { label: "Contact d'urgence", field: "contact_urgence_nom", display: patient.contact_urgence_nom || "—", raw: patient.contact_urgence_nom || "" },
    { label: "Tél. contact urgence", field: "contact_urgence_telephone", display: patient.contact_urgence_telephone || "—", raw: patient.contact_urgence_telephone || "" },
    { label: "Lien", field: "contact_urgence_lien", display: patient.contact_urgence_lien || "—", raw: patient.contact_urgence_lien || "" },
  ];

  const pharmRows: { label: string; field: string; display: string; raw: string }[] = [
    { label: "Pharmacie", field: "pharmacie_nom", display: patient.pharmacie_nom || "—", raw: patient.pharmacie_nom || "" },
    { label: "Tél. pharmacie", field: "pharmacie_telephone", display: patient.pharmacie_telephone || "—", raw: patient.pharmacie_telephone || "" },
    { label: "Adresse pharmacie", field: "pharmacie_adresse", display: patient.pharmacie_adresse || "—", raw: patient.pharmacie_adresse || "" },
  ];

  function EditableRow({ label, field, display, raw = "", editable }: { label: string; field: string; display: string; raw?: string; editable: boolean }) {
    const isEditing = editingField === field;
    return (
      <div className="flex items-center justify-between px-6 py-3">
        <span className="w-44 shrink-0 text-sm font-medium text-slate-500">{label}</span>
        {isEditing ? (
          <div className="flex flex-1 items-center gap-2">
            <input value={editValue} onChange={e => setEditValue(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") saveEdit(field); if (e.key === "Escape") setEditingField(null); }}
              autoFocus className="flex-1 rounded-md border border-primary-light px-2 py-1 text-sm focus:outline-none" />
            <button onClick={() => saveEdit(field)} disabled={saving}
              className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-white disabled:opacity-50">
              {saving ? "…" : "OK"}
            </button>
            <button onClick={() => setEditingField(null)}
              className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600">
              Annuler
            </button>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-between">
            <span className="text-sm text-slate-900">{display}</span>
            {canEdit && editable && field && (
              <button onClick={() => { setEditingField(field); setEditValue(raw); }}
                className="ml-2 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-4 border-b border-slate-100 p-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
          {patient.prenom[0]}{patient.nom[0]}
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{patient.prenom} {patient.nom}</h2>
          <p className="text-sm text-slate-500">
            {getAge(patient.date_naissance)} ans · {patient.sexe === "HOMME" ? "Homme" : "Femme"}
            {patient.numero_assurance && <> · {patient.numero_assurance}</>}
          </p>
        </div>
      </div>
      <div className="divide-y divide-slate-100">
        {rows.map(r => <EditableRow key={r.label} {...r} />)}
        <SectionHeader label="Contact d'urgence" />
        {urgRows.map(r => <EditableRow key={r.label} {...r} editable={true} />)}
        <SectionHeader label="Pharmacie" />
        {pharmRows.map(r => <EditableRow key={r.label} {...r} editable={true} />)}
        <SectionHeader label="Médecin traitant" />
        <div className="px-6 py-3">
          <span className="w-44 shrink-0 text-sm font-medium text-slate-500">Médecin</span>
          {patient.medecin_traitant ? (
            <span className="ml-4 text-sm font-medium text-primary">
              {patient.medecin_traitant.role === "MEDECIN_SPECIALISTE" ? "Dre" : "Dr"}{" "}
              {patient.medecin_traitant.prenom} {patient.medecin_traitant.nom}
              {patient.medecin_traitant.institution && <span className="font-normal text-slate-500"> · {patient.medecin_traitant.institution}</span>}
            </span>
          ) : (
            <span className="ml-4 text-sm italic text-slate-400">Non assigné</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Consultations ───────────────────────────────────────────────────────

function ConsultationsTab({ dossierId, canEdit }: { dossierId: string; canEdit: boolean }) {
  const { user } = useAuth();
  const [items, setItems] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ motif: "", diagnostic: "", notes: "" });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await apiFetch(`/consultations/dossier/${dossierId}`);
      if (res.ok) setItems(await res.json());
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [dossierId]);

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiFetch(`/consultations/dossier/${dossierId}`, {
        method: "POST",
        body: JSON.stringify({ motif: form.motif, diagnostic: form.diagnostic || null, notes: form.notes || null }),
      });
      if (res.ok) { setShowForm(false); setForm({ motif: "", diagnostic: "", notes: "" }); load(); }
    } finally { setSaving(false); }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      {user && canAddConsultation(user.role) && !showForm && (
        <button onClick={() => setShowForm(true)}
          className="mb-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
          + Nouvelle consultation
        </button>
      )}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800">Nouvelle consultation</h3>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Motif *</label>
            <input value={form.motif} onChange={e => setForm(f => ({ ...f, motif: e.target.value }))} required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Diagnostic</label>
            <input value={form.diagnostic} onChange={e => setForm(f => ({ ...f, diagnostic: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3}
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600">
              Annuler
            </button>
          </div>
        </form>
      )}
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">Aucune consultation.</p>
      ) : (
        <div className="space-y-3">
          {items.map(c => (
            <div key={c.id_consultation} className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="font-medium text-slate-900">{c.motif}</p>
              {c.diagnostic && <p className="mt-1 text-sm text-slate-600">Diagnostic : {c.diagnostic}</p>}
              {c.notes && <p className="mt-1 text-sm text-slate-500 italic">{c.notes}</p>}
              <p className="mt-2 text-xs text-slate-400">{new Date(c.date).toLocaleDateString("fr-CA")}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tab: Observations ────────────────────────────────────────────────────────

function ObservationsTab({ dossierId, canEdit }: { dossierId: string; canEdit: boolean }) {
  const { user } = useAuth();
  const [items, setItems] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [contenu, setContenu] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await apiFetch(`/observations/dossier/${dossierId}`);
      if (res.ok) setItems(await res.json());
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [dossierId]);

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiFetch(`/observations/dossier/${dossierId}`, {
        method: "POST", body: JSON.stringify({ contenu }),
      });
      if (res.ok) { setShowForm(false); setContenu(""); load(); }
    } finally { setSaving(false); }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      {user && canAddObservation(user.role) && !showForm && (
        <button onClick={() => setShowForm(true)}
          className="mb-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark">
          + Nouvelle observation
        </button>
      )}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800">Nouvelle observation</h3>
          <textarea value={contenu} onChange={e => setContenu(e.target.value)} rows={4} required
            placeholder="Contenu de l'observation…"
            className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <div className="flex gap-2">
            <button type="submit" disabled={saving}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600">
              Annuler
            </button>
          </div>
        </form>
      )}
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">Aucune observation.</p>
      ) : (
        <div className="space-y-3">
          {items.map(o => (
            <div key={o.id_observation} className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-800 whitespace-pre-wrap">{o.contenu}</p>
              <p className="mt-2 text-xs text-slate-400">
                {new Date(o.date).toLocaleDateString("fr-CA")}
                {o.auteur && ` · ${o.auteur.prenom} ${o.auteur.nom}`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tab: Prescriptions ───────────────────────────────────────────────────────

function PrescriptionsTab({ dossierId, canEdit }: { dossierId: string; canEdit: boolean }) {
  const { user } = useAuth();
  const [items, setItems] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await apiFetch(`/prescriptions/dossier/${dossierId}`);
      if (res.ok) setItems(await res.json());
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [dossierId]);

  if (loading) return <Spinner />;

  return (
    <div>
      {user && canAddPrescription(user.role) && (
        <p className="mb-4 text-sm text-slate-500">Les prescriptions sont gérées via la plateforme web.</p>
      )}
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">Aucune prescription.</p>
      ) : (
        <div className="space-y-3">
          {items.map(p => (
            <div key={p.id_prescription} className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-400 mb-2">{new Date(p.date).toLocaleDateString("fr-CA")}</p>
              <ul className="space-y-1">
                {p.medicaments.map((m, i) => (
                  <li key={i} className="text-sm text-slate-800">
                    • <span className="font-medium">{m.medicament.nom}</span>
                    {m.medicament.dosage && ` ${m.medicament.dosage}`}
                    {m.posologie && <span className="text-slate-500"> — {m.posologie}</span>}
                    {m.duree_jours && <span className="text-slate-500"> ({m.duree_jours} j)</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tab: Hospitalisations ────────────────────────────────────────────────────

function HospitalisationsTab({ dossierId, canEdit }: { dossierId: string; canEdit: boolean }) {
  const [items, setItems] = useState<Hospitalisation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/hospitalisations/dossier/${dossierId}`)
      .then(r => r.ok ? r.json() : [])
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [dossierId]);

  if (loading) return <Spinner />;

  return (
    <div>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">Aucune hospitalisation.</p>
      ) : (
        <div className="space-y-3">
          {items.map(h => (
            <div key={h.id_hospitalisation} className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="font-medium text-slate-900">{h.motif}</p>
              {h.etablissement && <p className="mt-0.5 text-sm text-slate-600">{h.etablissement}</p>}
              <p className="mt-1 text-xs text-slate-400">
                {new Date(h.date_admission).toLocaleDateString("fr-CA")}
                {h.date_sortie ? ` → ${new Date(h.date_sortie).toLocaleDateString("fr-CA")}` : " (en cours)"}
              </p>
              {h.notes && <p className="mt-2 text-sm text-slate-500 italic">{h.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function Spinner() {
  return <div className="flex justify-center py-10">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>;
}

function ErrMsg({ msg, onRetry }: { msg: string; onRetry: () => void }) {
  return <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
    {msg}{" "}
    <button onClick={onRetry} className="font-medium underline">Réessayer</button>
  </div>;
}

function SectionHeader({ label }: { label: string }) {
  return <div className="bg-slate-50 px-6 py-2.5">
    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
  </div>;
}
