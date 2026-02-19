"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useApi } from "@/hooks/use-api";
import { getRoleLabel } from "@/lib/roles";
import LoadingSpinner from "@/components/loading-spinner";

interface DossierItem {
  id_dossier: string;
  patient: {
    nom: string;
    prenom: string;
    date_naissance: string;
    sexe: string;
  };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: dossiers, loading } = useApi<DossierItem[]>("/patients/dossiers");

  if (!user) return null;

  const isPatient = user.role === "PATIENT";
  const isMedecin = ["MEDECIN_GENERAL", "MEDECIN_SPECIALISTE"].includes(user.role);
  const canUrgence = ["AMBULANCIER", "MEDECIN_GENERAL", "MEDECIN_SPECIALISTE", "ADMIN"].includes(user.role);
  const isPro = ["MEDECIN_GENERAL", "MEDECIN_SPECIALISTE", "INFIRMIER", "PHARMACIEN"].includes(user.role);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
      <p className="mt-1 text-slate-500">
        Bienvenue, vous etes connecte en tant que{" "}
        <span className="font-medium">{getRoleLabel(user.role)}</span>
      </p>

      {/* Cartes de navigation */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isPatient && (
          <DashCard
            title="Mon dossier medical"
            description="Consultez vos consultations, observations et prescriptions"
            href="/patients"
            icon={<IconDossier />}
            color="bg-primary"
          />
        )}

        {isPro && (
          <DashCard
            title="Patients"
            description={loading ? "Chargement..." : `${dossiers?.length || 0} dossier${(dossiers?.length || 0) > 1 ? "s" : ""} accessible${(dossiers?.length || 0) > 1 ? "s" : ""}`}
            href="/patients"
            icon={<IconPatients />}
            color="bg-primary"
          />
        )}

        {canUrgence && (
          <DashCard
            title="Acces d'urgence"
            description="Obtenir un acces temporaire a un dossier en situation d'urgence"
            href="/urgence"
            icon={<IconUrgence />}
            color="bg-danger"
          />
        )}

        {user.role === "ADMIN" && (
          <DashCard
            title="Administration"
            description="Gerer les comptes et les utilisateurs"
            href="/admin/utilisateurs"
            icon={<IconAdmin />}
            color="bg-slate-700"
          />
        )}
      </div>

      {/* Derniers patients consultés (accès rapide) */}
      {isPro && dossiers && dossiers.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-slate-900">Acces rapide - Patients</h2>
          <p className="mt-1 text-sm text-slate-500">Cliquez sur un patient pour ouvrir son dossier</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {dossiers.slice(0, 6).map((d) => (
              <Link
                key={d.id_dossier}
                href={`/dossier/${d.id_dossier}`}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 transition-all hover:border-primary-light hover:shadow-sm"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {d.patient.prenom[0]}{d.patient.nom[0]}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {d.patient.nom}, {d.patient.prenom}
                  </p>
                  <p className="text-xs text-slate-500">
                    {d.patient.sexe === "HOMME" ? "H" : "F"} &middot; {getAge(d.patient.date_naissance)} ans
                  </p>
                </div>
              </Link>
            ))}
          </div>
          {dossiers.length > 6 && (
            <Link href="/patients" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
              Voir les {dossiers.length} patients →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function getAge(dateNaissance: string) {
  const birth = new Date(dateNaissance);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

function DashCard({
  title,
  description,
  href,
  icon,
  color,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg ${color} text-white`}>
        {icon}
      </div>
      <h3 className="font-semibold text-slate-900 group-hover:text-primary">
        {title}
      </h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </Link>
  );
}

function IconPatients() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function IconDossier() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function IconUrgence() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconAdmin() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
