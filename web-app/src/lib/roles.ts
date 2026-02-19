import type { Role } from "./types";

export interface MenuItem {
  label: string;
  href: string;
  icon: "home" | "folder" | "users" | "alert" | "pill" | "settings" | "stethoscope";
}

export const ROLE_MENU: Record<Role, MenuItem[]> = {
  PATIENT: [
    { label: "Tableau de bord", href: "/dashboard", icon: "home" },
    { label: "Mon dossier", href: "/dossier/me", icon: "folder" },
    { label: "Médecins", href: "/medecins", icon: "stethoscope" },
  ],
  INFIRMIER: [
    { label: "Tableau de bord", href: "/dashboard", icon: "home" },
    { label: "Patients", href: "/patients", icon: "users" },
    { label: "Médecins", href: "/medecins", icon: "stethoscope" },
  ],
  AMBULANCIER: [
    { label: "Tableau de bord", href: "/dashboard", icon: "home" },
    { label: "Urgence", href: "/urgence", icon: "alert" },
    { label: "Médecins", href: "/medecins", icon: "stethoscope" },
  ],
  PHARMACIEN: [
    { label: "Tableau de bord", href: "/dashboard", icon: "home" },
    { label: "Patients", href: "/patients", icon: "users" },
    { label: "Médecins", href: "/medecins", icon: "stethoscope" },
  ],
  MEDECIN_GENERAL: [
    { label: "Tableau de bord", href: "/dashboard", icon: "home" },
    { label: "Patients", href: "/patients", icon: "users" },
    { label: "Médecins", href: "/medecins", icon: "stethoscope" },
    { label: "Urgence", href: "/urgence", icon: "alert" },
  ],
  MEDECIN_SPECIALISTE: [
    { label: "Tableau de bord", href: "/dashboard", icon: "home" },
    { label: "Patients", href: "/patients", icon: "users" },
    { label: "Médecins", href: "/medecins", icon: "stethoscope" },
    { label: "Urgence", href: "/urgence", icon: "alert" },
  ],
  ADMIN: [
    { label: "Tableau de bord", href: "/dashboard", icon: "home" },
    { label: "Patients", href: "/patients", icon: "users" },
    { label: "Médecins", href: "/medecins", icon: "stethoscope" },
    { label: "Urgence", href: "/urgence", icon: "alert" },
  ],
};

export function canAddConsultation(role: Role): boolean {
  return ["MEDECIN_GENERAL", "MEDECIN_SPECIALISTE"].includes(role);
}

export function canAddObservation(role: Role): boolean {
  return ["MEDECIN_GENERAL", "MEDECIN_SPECIALISTE", "INFIRMIER"].includes(role);
}

export function canAddPrescription(role: Role): boolean {
  return ["MEDECIN_GENERAL", "MEDECIN_SPECIALISTE"].includes(role);
}

export function canModify(role: Role): boolean {
  return ["MEDECIN_GENERAL", "MEDECIN_SPECIALISTE"].includes(role);
}

export function canDelete(role: Role): boolean {
  return ["MEDECIN_GENERAL", "MEDECIN_SPECIALISTE"].includes(role);
}

export function getRoleLabel(role: Role): string {
  const labels: Record<Role, string> = {
    PATIENT: "Patient",
    INFIRMIER: "Infirmier(e)",
    AMBULANCIER: "Ambulancier(e)",
    PHARMACIEN: "Pharmacien(ne)",
    MEDECIN_GENERAL: "Medecin generaliste",
    MEDECIN_SPECIALISTE: "Medecin specialiste",
    ADMIN: "Administrateur",
  };
  return labels[role];
}
