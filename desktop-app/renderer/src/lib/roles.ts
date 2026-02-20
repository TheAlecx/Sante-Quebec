import type { Role } from "./types";

export interface MenuItem {
  label: string;
  to: string;
  icon: "home" | "folder" | "users" | "alert" | "pill" | "settings" | "stethoscope" | "shield";
}

export const ROLE_MENU: Record<Role, MenuItem[]> = {
  PATIENT: [
    { label: "Tableau de bord", to: "/dashboard", icon: "home" },
    { label: "Mon dossier", to: "/dossier/me", icon: "folder" },
    { label: "Médecins", to: "/medecins", icon: "stethoscope" },
  ],
  INFIRMIER: [
    { label: "Tableau de bord", to: "/dashboard", icon: "home" },
    { label: "Patients", to: "/patients", icon: "users" },
    { label: "Médecins", to: "/medecins", icon: "stethoscope" },
  ],
  AMBULANCIER: [
    { label: "Tableau de bord", to: "/dashboard", icon: "home" },
    { label: "Urgence", to: "/urgence", icon: "alert" },
    { label: "Médecins", to: "/medecins", icon: "stethoscope" },
  ],
  PHARMACIEN: [
    { label: "Tableau de bord", to: "/dashboard", icon: "home" },
    { label: "Patients", to: "/patients", icon: "users" },
    { label: "Médecins", to: "/medecins", icon: "stethoscope" },
  ],
  MEDECIN_GENERAL: [
    { label: "Tableau de bord", to: "/dashboard", icon: "home" },
    { label: "Patients", to: "/patients", icon: "users" },
    { label: "Médecins", to: "/medecins", icon: "stethoscope" },
    { label: "Urgence", to: "/urgence", icon: "alert" },
  ],
  MEDECIN_SPECIALISTE: [
    { label: "Tableau de bord", to: "/dashboard", icon: "home" },
    { label: "Patients", to: "/patients", icon: "users" },
    { label: "Médecins", to: "/medecins", icon: "stethoscope" },
    { label: "Urgence", to: "/urgence", icon: "alert" },
  ],
  ADMIN: [
    { label: "Tableau de bord", to: "/dashboard", icon: "home" },
    { label: "Patients", to: "/patients", icon: "users" },
    { label: "Médecins", to: "/medecins", icon: "stethoscope" },
    { label: "Urgence", to: "/urgence", icon: "alert" },
    { label: "Administration", to: "/admin/utilisateurs", icon: "shield" },
  ],
};

export function getRoleLabel(role: Role): string {
  const labels: Record<Role, string> = {
    PATIENT: "Patient",
    INFIRMIER: "Infirmier(e)",
    AMBULANCIER: "Ambulancier(e)",
    PHARMACIEN: "Pharmacien(ne)",
    MEDECIN_GENERAL: "Médecin généraliste",
    MEDECIN_SPECIALISTE: "Médecin spécialiste",
    ADMIN: "Administrateur",
  };
  return labels[role];
}

export function canAddConsultation(role: Role) {
  return ["MEDECIN_GENERAL", "MEDECIN_SPECIALISTE"].includes(role);
}
export function canAddObservation(role: Role) {
  return ["MEDECIN_GENERAL", "MEDECIN_SPECIALISTE", "INFIRMIER"].includes(role);
}
export function canAddPrescription(role: Role) {
  return ["MEDECIN_GENERAL", "MEDECIN_SPECIALISTE"].includes(role);
}
export function canModify(role: Role) {
  return ["MEDECIN_GENERAL", "MEDECIN_SPECIALISTE"].includes(role);
}
