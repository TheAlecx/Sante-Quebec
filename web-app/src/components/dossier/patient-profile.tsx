"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import LoadingSpinner from "@/components/loading-spinner";
import ErrorMessage from "@/components/error-message";
import EtablissementAutocomplete from "@/components/ui/etablissement-autocomplete";

interface PatientData {
  id_patient: string;
  nom: string;
  prenom: string;
  date_naissance: string;
  sexe: string;
  numero_assurance: string | null;
  telephone: string | null;
  adresse: string | null;
  taille_cm: number | null;
  poids_kg: number | null;
  photo_url: string | null;
  contact_urgence_nom: string | null;
  contact_urgence_telephone: string | null;
  contact_urgence_lien: string | null;
  pharmacie_nom: string | null;
  pharmacie_telephone: string | null;
  pharmacie_adresse: string | null;
  medecin_traitant: {
    id_utilisateur: string;
    nom: string;
    prenom: string;
    role: string;
    institution: string | null;
  } | null;
}

interface MedecinItem {
  id_utilisateur: string;
  nom: string;
  prenom: string;
  role: string;
  institution: string | null;
}

interface Props {
  dossierId: string;
  canEdit: boolean;
  canNurseEdit?: boolean;
}

export default function PatientProfile({ dossierId, canEdit, canNurseEdit = false }: Props) {
  const router = useRouter();
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [pharmaAdresse, setPharmaAdresse] = useState("");

  const [editingMedecin, setEditingMedecin] = useState(false);
  const [medecins, setMedecins] = useState<MedecinItem[]>([]);
  const [loadingMedecins, setLoadingMedecins] = useState(false);
  const [selectedMedecinId, setSelectedMedecinId] = useState("");
  const [savingMedecin, setSavingMedecin] = useState(false);

  async function fetchPatient() {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch(`/patients/dossier/${dossierId}`);
      if (!res.ok) throw new Error("Erreur lors du chargement du profil");
      const data = await res.json();
      setPatient(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPatient();
  }, [dossierId]);

  function startEdit(field: string, currentValue: string) {
    setEditingField(field);
    setEditValue(currentValue);
    if (field === "pharmacie_nom") setPharmaAdresse("");
  }

  function cancelEdit() {
    setEditingField(null);
    setEditValue("");
    setPharmaAdresse("");
  }

  async function saveEdit(field: string) {
    if (!patient) return;
    setSaving(true);
    try {
      const body: Record<string, string | null> = { [field]: editValue };
      if (field === "pharmacie_nom" && pharmaAdresse) {
        body.pharmacie_adresse = pharmaAdresse;
      }
      const res = await apiFetch(`/patients/dossier/${dossierId}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Erreur lors de la sauvegarde");
      const updated = await res.json();
      setPatient({ ...updated, medecin_traitant: patient!.medecin_traitant });
      setEditingField(null);
      setEditValue("");
      setPharmaAdresse("");
    } catch {
      // keep editing state on error
    } finally {
      setSaving(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent, field: string) {
    if (e.key === "Enter") saveEdit(field);
    if (e.key === "Escape") cancelEdit();
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={fetchPatient} />;
  if (!patient) return null;

  function getAge(dateStr: string) {
    const birth = new Date(dateStr);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age;
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("fr-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function getBMI() {
    if (!patient!.taille_cm || !patient!.poids_kg) return null;
    const heightM = patient!.taille_cm / 100;
    return (patient!.poids_kg / (heightM * heightM)).toFixed(1);
  }

  const bmi = getBMI();

  async function startEditMedecin() {
    setEditingMedecin(true);
    setSelectedMedecinId(patient?.medecin_traitant?.id_utilisateur || "");
    setLoadingMedecins(true);
    try {
      const res = await apiFetch("/medecins");
      if (res.ok) {
        const data: MedecinItem[] = await res.json();
        setMedecins(data);
      }
    } finally {
      setLoadingMedecins(false);
    }
  }

  async function saveMedecin() {
    setSavingMedecin(true);
    try {
      const res = await apiFetch(`/patients/dossier/${dossierId}/medecin-traitant`, {
        method: "PUT",
        body: JSON.stringify({ medecin_traitant_id: selectedMedecinId || null }),
      });
      if (res.ok) {
        await fetchPatient();
        setEditingMedecin(false);
      }
    } finally {
      setSavingMedecin(false);
    }
  }

  const fields: { label: string; field: string; value: string; editable: boolean; nurseEditable: boolean; type?: string }[] = [
    { label: "Nom", field: "nom", value: patient.nom, editable: true, nurseEditable: false },
    { label: "Prenom", field: "prenom", value: patient.prenom, editable: true, nurseEditable: false },
    { label: "Date de naissance", field: "date_naissance", value: formatDate(patient.date_naissance), editable: false, nurseEditable: false },
    { label: "Age", field: "", value: `${getAge(patient.date_naissance)} ans`, editable: false, nurseEditable: false },
    { label: "Sexe", field: "sexe", value: patient.sexe === "HOMME" ? "Homme" : "Femme", editable: false, nurseEditable: false },
    { label: "N° Assurance maladie", field: "numero_assurance", value: patient.numero_assurance || "—", editable: true, nurseEditable: false },
    { label: "Telephone", field: "telephone", value: patient.telephone || "—", editable: true, nurseEditable: false },
    { label: "Adresse", field: "adresse", value: patient.adresse || "—", editable: true, nurseEditable: false },
    { label: "Taille", field: "taille_cm", value: patient.taille_cm ? `${patient.taille_cm} cm` : "—", editable: true, nurseEditable: true, type: "number" },
    { label: "Poids", field: "poids_kg", value: patient.poids_kg ? `${patient.poids_kg} kg` : "—", editable: true, nurseEditable: true, type: "number" },
    { label: "IMC", field: "", value: bmi ? `${bmi} kg/m²` : "—", editable: false, nurseEditable: false },
    { label: "", field: "", value: "CONTACT_URGENCE_SEPARATOR", editable: false, nurseEditable: false },
    { label: "Contact d'urgence", field: "contact_urgence_nom", value: patient.contact_urgence_nom || "—", editable: true, nurseEditable: true },
    { label: "Tel. contact urgence", field: "contact_urgence_telephone", value: patient.contact_urgence_telephone || "—", editable: true, nurseEditable: true },
    { label: "Lien", field: "contact_urgence_lien", value: patient.contact_urgence_lien || "—", editable: true, nurseEditable: true },
    { label: "", field: "", value: "PHARMACIE_SEPARATOR", editable: false, nurseEditable: false },
    { label: "Pharmacie", field: "pharmacie_nom", value: patient.pharmacie_nom || "—", editable: true, nurseEditable: true },
    { label: "Tel. pharmacie", field: "pharmacie_telephone", value: patient.pharmacie_telephone || "—", editable: true, nurseEditable: true },
    { label: "Adresse pharmacie", field: "pharmacie_adresse", value: patient.pharmacie_adresse || "—", editable: true, nurseEditable: true },
    { label: "", field: "", value: "MEDECIN_SEPARATOR", editable: false, nurseEditable: false },
  ];

  function getRawValue(field: string): string {
    if (!patient) return "";
    const map: Record<string, string> = {
      nom: patient.nom,
      prenom: patient.prenom,
      numero_assurance: patient.numero_assurance || "",
      telephone: patient.telephone || "",
      adresse: patient.adresse || "",
      taille_cm: patient.taille_cm?.toString() || "",
      poids_kg: patient.poids_kg?.toString() || "",
      contact_urgence_nom: patient.contact_urgence_nom || "",
      contact_urgence_telephone: patient.contact_urgence_telephone || "",
      contact_urgence_lien: patient.contact_urgence_lien || "",
      pharmacie_nom: patient.pharmacie_nom || "",
      pharmacie_telephone: patient.pharmacie_telephone || "",
      pharmacie_adresse: patient.pharmacie_adresse || "",
    };
    return map[field] || "";
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header avec avatar */}
      <div className="flex items-center gap-4 border-b border-slate-100 p-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
          {patient.prenom[0]}{patient.nom[0]}
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {patient.prenom} {patient.nom}
          </h2>
          <p className="text-sm text-slate-500">
            {getAge(patient.date_naissance)} ans &middot; {patient.sexe === "HOMME" ? "Homme" : "Femme"}
            {patient.numero_assurance && <> &middot; {patient.numero_assurance}</>}
          </p>
        </div>
      </div>

      {/* Tableau des informations */}
      <div className="divide-y divide-slate-100">
        {fields.map((f) => {
          if (f.value === "CONTACT_URGENCE_SEPARATOR") {
            return (
              <div key="separator-urgence" className="bg-slate-50 px-6 py-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Contact d&apos;urgence</span>
              </div>
            );
          }
          if (f.value === "PHARMACIE_SEPARATOR") {
            return (
              <div key="separator-pharmacie" className="bg-slate-50 px-6 py-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pharmacie</span>
              </div>
            );
          }
          if (f.value === "MEDECIN_SEPARATOR") {
            return (
              <div key="separator-medecin">
                <div className="bg-slate-50 px-6 py-2.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Médecin traitant</span>
                </div>
                <div className="flex items-center justify-between px-6 py-3">
                  <span className="w-44 shrink-0 text-sm font-medium text-slate-500">Médecin</span>
                  {editingMedecin ? (
                    <div className="flex flex-1 items-center gap-2">
                      {loadingMedecins ? (
                        <span className="text-sm text-slate-400">Chargement...</span>
                      ) : (
                        <select
                          value={selectedMedecinId}
                          onChange={(e) => setSelectedMedecinId(e.target.value)}
                          autoFocus
                          className="flex-1 rounded-md border border-primary-light px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light/30"
                        >
                          <option value="">— Aucun —</option>
                          {medecins.map((m) => (
                            <option key={m.id_utilisateur} value={m.id_utilisateur}>
                              {m.role === "MEDECIN_SPECIALISTE" ? "Dre" : "Dr"} {m.prenom} {m.nom}
                              {m.institution ? ` · ${m.institution}` : ""}
                            </option>
                          ))}
                        </select>
                      )}
                      <button
                        onClick={saveMedecin}
                        disabled={savingMedecin || loadingMedecins}
                        className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-dark disabled:opacity-50"
                      >
                        {savingMedecin ? "..." : "OK"}
                      </button>
                      <button
                        onClick={() => setEditingMedecin(false)}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-1 items-center justify-between">
                      {patient.medecin_traitant ? (
                        <button
                          onClick={() => router.push(`/medecins/${patient.medecin_traitant!.id_utilisateur}`)}
                          className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                        >
                          {patient.medecin_traitant.role === "MEDECIN_SPECIALISTE" ? "Dre" : "Dr"}{" "}
                          {patient.medecin_traitant.prenom} {patient.medecin_traitant.nom}
                          {patient.medecin_traitant.institution && (
                            <span className="font-normal text-slate-500">· {patient.medecin_traitant.institution}</span>
                          )}
                          <svg className="h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </button>
                      ) : (
                        <span className="text-sm italic text-slate-400">Non assigné</span>
                      )}
                      {(canEdit || canNurseEdit) && (
                        <button
                          onClick={startEditMedecin}
                          className="ml-2 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                          title="Modifier le médecin traitant"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          }
          return (
          <div key={f.label} className="flex items-center justify-between px-6 py-3">
            <span className="text-sm font-medium text-slate-500 w-44 shrink-0">{f.label}</span>

            {editingField === f.field ? (
              <div className="flex flex-1 items-center gap-2">
                {f.field === "pharmacie_nom" ? (
                  <EtablissementAutocomplete
                    value={editValue}
                    onChange={setEditValue}
                    onSelectAdresse={setPharmaAdresse}
                    placeholder="Rechercher une pharmacie..."
                    autoFocus
                  />
                ) : (
                  <input
                    type={f.type || "text"}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, f.field)}
                    autoFocus
                    className="flex-1 rounded-md border border-primary-light px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light/30"
                  />
                )}
                <button
                  onClick={() => saveEdit(f.field)}
                  disabled={saving}
                  className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-white hover:bg-primary-dark disabled:opacity-50"
                >
                  {saving ? "..." : "OK"}
                </button>
                <button
                  onClick={cancelEdit}
                  className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-between">
                <span className="text-sm text-slate-900">{f.value}</span>
                {((canEdit && f.editable) || (canNurseEdit && f.nurseEditable)) && f.field && (
                  <button
                    onClick={() => startEdit(f.field, getRawValue(f.field))}
                    className="ml-2 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    title={`Modifier ${f.label.toLowerCase()}`}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
          );
        })}
      </div>
    </div>
  );
}
