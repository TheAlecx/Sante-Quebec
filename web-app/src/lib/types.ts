export type Role =
  | "PATIENT"
  | "INFIRMIER"
  | "AMBULANCIER"
  | "PHARMACIEN"
  | "MEDECIN_GENERAL"
  | "MEDECIN_SPECIALISTE"
  | "ADMIN";

export interface User {
  id: string;
  email: string;
  role: Role;
}

export interface LoginResponse {
  token: string;
  id: string;
  email: string;
  role: Role;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface Patient {
  id_patient: string;
  nom: string;
  prenom: string;
  date_naissance: string;
  sexe: "HOMME" | "FEMME";
  numero_assurance?: string;
  telephone?: string;
  adresse?: string;
  dossier?: DossierMedical;
}

export interface DossierMedical {
  id_dossier: string;
  date_creation: string;
  etat?: string;
  patient_id: string;
}

export interface Consultation {
  id_consultation: string;
  date: string;
  motif: string;
  diagnostic?: string;
  dossier_id: string;
  cree_par: string;
  createdAt: string;
}

export interface ObservationMedicale {
  id_observation: string;
  type: string;
  valeur: string;
  date: string;
  dossier_id: string;
  cree_par: string;
  createdAt: string;
}

export interface Medicament {
  id_medicament: string;
  nom: string;
  dosage?: string;
}

export interface PrescriptionMedicament {
  prescription_id: string;
  medicament_id: string;
  medicament: Medicament;
}

export interface Prescription {
  id_prescription: string;
  date: string;
  instructions?: string;
  dossier_id: string;
  medecin_id: string;
  medicaments: PrescriptionMedicament[];
  createdAt: string;
}
