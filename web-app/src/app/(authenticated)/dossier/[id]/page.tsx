"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import PatientProfile from "@/components/dossier/patient-profile";
import ConsultationTab from "@/components/dossier/consultation-tab";
import ObservationTab from "@/components/dossier/observation-tab";
import PrescriptionTab from "@/components/dossier/prescription-tab";
import HospitalisationTab from "@/components/dossier/hospitalisation-tab";
import { useAuth } from "@/lib/auth-context";
import { canModify } from "@/lib/roles";
import { apiFetch } from "@/lib/api";

type Tab = "profil" | "consultations" | "observations" | "prescriptions" | "hospitalisations";

interface Specialiste {
  id_utilisateur: string;
  nom: string;
  prenom: string;
  institution: string | null;
}

const TABS: { key: Tab; label: string }[] = [
  { key: "profil", label: "Profil" },
  { key: "consultations", label: "Consultations" },
  { key: "observations", label: "Observations" },
  { key: "prescriptions", label: "Prescriptions" },
  { key: "hospitalisations", label: "Hospitalisations" },
];

export default function DossierPage() {
  const params = useParams();
  const dossierId = params.id as string;
  const [activeTab, setActiveTab] = useState<Tab>("profil");
  const { user } = useAuth();

  const userCanEdit = user ? canModify(user.role) : false;
  const peutRefer = user?.role === "MEDECIN_GENERAL";

  // ── Référence spécialiste ─────────────────────────────────────────────────
  const [referModal, setReferModal] = useState(false);
  const [specialistes, setSpecialistes] = useState<Specialiste[]>([]);
  const [loadingSpec, setLoadingSpec] = useState(false);
  const [selectedSpec, setSelectedSpec] = useState("");
  const [motifRefer, setMotifRefer] = useState("");
  const [referEnvoyee, setReferEnvoyee] = useState(false);

  async function ouvrirReferModal() {
    setSelectedSpec("");
    setMotifRefer("");
    setReferEnvoyee(false);
    setReferModal(true);
    setLoadingSpec(true);
    try {
      const res = await apiFetch("/medecins");
      if (res.ok) {
        const data: Specialiste[] = await res.json();
        setSpecialistes(data.filter((m) => (m as { role?: string }).role === "MEDECIN_SPECIALISTE"));
      }
    } finally {
      setLoadingSpec(false);
    }
  }

  function confirmerReference() {
    if (!selectedSpec) return;
    setReferEnvoyee(true);
  }

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dossier medical</h1>
          <p className="mt-1 text-sm text-slate-500">ID : {dossierId}</p>
        </div>

        {peutRefer && (
          <button
            onClick={ouvrirReferModal}
            className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Référer à un spécialiste
          </button>
        )}
      </div>

      <div className="mt-6 border-b border-slate-200">
        <nav className="flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === "profil" && <PatientProfile dossierId={dossierId} canEdit={userCanEdit} />}
        {activeTab === "consultations" && <ConsultationTab dossierId={dossierId} />}
        {activeTab === "observations" && <ObservationTab dossierId={dossierId} />}
        {activeTab === "prescriptions" && <PrescriptionTab dossierId={dossierId} />}
        {activeTab === "hospitalisations" && <HospitalisationTab dossierId={dossierId} />}
      </div>

      {/* ── Modal référence spécialiste ─────────────────────────────────── */}
      {referModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Référer à un spécialiste</h2>
              <button
                onClick={() => setReferModal(false)}
                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5">
              {referEnvoyee ? (
                /* ── Confirmation ── */
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                      <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-green-800">Référence envoyée avec succès</p>
                      <p className="mt-0.5 text-sm text-green-700">
                        Le patient a bien été référé à{" "}
                        <span className="font-medium">
                          {(() => {
                            const s = specialistes.find((x) => x.id_utilisateur === selectedSpec);
                            return s ? `Dre ${s.prenom} ${s.nom}${s.institution ? ` (${s.institution})` : ""}` : "";
                          })()}
                        </span>.
                      </p>
                    </div>
                  </div>
                  <p className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                    Le patient sera contacté sous peu pour la prise d&apos;un rendez-vous avec le médecin spécialiste.
                  </p>
                  <button
                    onClick={() => setReferModal(false)}
                    className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
                  >
                    Fermer
                  </button>
                </div>
              ) : (
                /* ── Formulaire ── */
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Médecin spécialiste <span className="text-red-500">*</span>
                    </label>
                    {loadingSpec ? (
                      <p className="text-sm text-slate-400">Chargement des spécialistes…</p>
                    ) : specialistes.length === 0 ? (
                      <p className="text-sm italic text-slate-400">Aucun spécialiste disponible sur la plateforme.</p>
                    ) : (
                      <select
                        value={selectedSpec}
                        onChange={(e) => setSelectedSpec(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20"
                      >
                        <option value="">— Sélectionner un spécialiste —</option>
                        {specialistes.map((s) => (
                          <option key={s.id_utilisateur} value={s.id_utilisateur}>
                            Dre {s.prenom} {s.nom}{s.institution ? ` · ${s.institution}` : ""}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Motif de la référence
                    </label>
                    <textarea
                      value={motifRefer}
                      onChange={(e) => setMotifRefer(e.target.value)}
                      rows={3}
                      placeholder="Ex. : Suivi cardiologique, douleurs chroniques, second avis…"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20 resize-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={confirmerReference}
                      disabled={!selectedSpec}
                      className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-40"
                    >
                      Envoyer la référence
                    </button>
                    <button
                      onClick={() => setReferModal(false)}
                      className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
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
