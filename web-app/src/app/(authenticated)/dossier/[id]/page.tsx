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

type Tab = "profil" | "consultations" | "observations" | "prescriptions" | "hospitalisations";

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

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Dossier medical</h1>
      <p className="mt-1 text-sm text-slate-500">ID : {dossierId}</p>

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
    </div>
  );
}
