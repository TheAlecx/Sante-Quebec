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

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  id: string;
  email: string;
  role: Role;
}
