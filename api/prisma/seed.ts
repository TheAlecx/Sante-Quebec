import { Role, Sexe } from "../src/generated/prisma/client";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client/extension";


const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Début du seed Prisma...");

  // ===============================
  // UTILISATEURS
  // ===============================
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const admin = await prisma.utilisateur.create({
    data: {
      email: "admin@medical.local",
      mot_de_passe: passwordHash,
      nom: "Admin",
      prenom: "System",
      role: Role.ADMIN
    }
  });

  const medecin = await prisma.utilisateur.create({
    data: {
      email: "medecin@medical.local",
      mot_de_passe: passwordHash,
      nom: "Tremblay",
      prenom: "Jean",
      role: Role.MEDECIN_GENERAL
    }
  });

  const infirmier = await prisma.utilisateur.create({
    data: {
      email: "infirmier@medical.local",
      mot_de_passe: passwordHash,
      nom: "Roy",
      prenom: "Marie",
      role: Role.INFIRMIER
    }
  });

  const patientUser = await prisma.utilisateur.create({
    data: {
      email: "patient@medical.local",
      mot_de_passe: passwordHash,
      nom: "Doe",
      prenom: "John",
      role: Role.PATIENT
    }
  });

  console.log("✅ Utilisateurs créés");

  // ===============================
  // PATIENT
  // ===============================
  const patient = await prisma.patient.create({
    data: {
      nom: "Doe",
      prenom: "John",
      date_naissance: new Date("1985-05-15"),
      sexe: Sexe.HOMME,
      numero_assurance: "DOEJ85051501",
      telephone: "514-555-1234",
      adresse: "123 rue de la Santé, Montréal"
    }
  });

  console.log("✅ Patient créé");

  // ===============================
  // DOSSIER MÉDICAL
  // ===============================
  const dossier = await prisma.dossierMedical.create({
    data: {
      patient_id: patient.id_patient,
      etat: "ACTIF"
    }
  });

  console.log("✅ Dossier médical créé");

  // ===============================
  // AUTORISATIONS
  // ===============================
  await prisma.autorisationDossier.createMany({
    data: [
      {
        utilisateur_id: medecin.id_utilisateur,
        dossier_id: dossier.id_dossier,
        lecture: true,
        ajout: true,
        modification: true,
        suppression: false
      },
      {
        utilisateur_id: infirmier.id_utilisateur,
        dossier_id: dossier.id_dossier,
        lecture: true,
        ajout: true,
        modification: false,
        suppression: false
      },
      {
        utilisateur_id: patientUser.id_utilisateur,
        dossier_id: dossier.id_dossier,
        lecture: true,
        ajout: false,
        modification: false,
        suppression: false
      }
    ]
  });

  console.log("✅ Autorisations définies");

  console.log("🌱 Seed terminé avec succès");
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
