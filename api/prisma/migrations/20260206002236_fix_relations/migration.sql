-- CreateEnum
CREATE TYPE "Sexe" AS ENUM ('HOMME', 'FEMME');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PATIENT', 'INFIRMIER', 'AMBULANCIER', 'PHARMACIEN', 'MEDECIN_GENERAL', 'MEDECIN_SPECIALISTE', 'ADMIN');

-- CreateEnum
CREATE TYPE "ActionAudit" AS ENUM ('LECTURE', 'CREATION', 'MODIFICATION', 'SUPPRESSION');

-- CreateEnum
CREATE TYPE "TypeAssurance" AS ENUM ('RAMQ', 'PRIVEE');

-- CreateEnum
CREATE TYPE "TypeEchange" AS ENUM ('VERIFICATION', 'RECLAMATION', 'REMBOURSEMENT');

-- CreateEnum
CREATE TYPE "StatutEchange" AS ENUM ('ENVOYE', 'ACCEPTE', 'REFUSE', 'ERREUR');

-- CreateTable
CREATE TABLE "Utilisateur" (
    "id_utilisateur" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mot_de_passe" TEXT NOT NULL,
    "nom" TEXT,
    "prenom" TEXT,
    "role" "Role" NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("id_utilisateur")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id_patient" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "date_naissance" TIMESTAMP(3) NOT NULL,
    "sexe" "Sexe" NOT NULL,
    "numero_assurance" TEXT,
    "telephone" TEXT,
    "adresse" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id_patient")
);

-- CreateTable
CREATE TABLE "DossierMedical" (
    "id_dossier" TEXT NOT NULL,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "etat" TEXT,
    "patient_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DossierMedical_pkey" PRIMARY KEY ("id_dossier")
);

-- CreateTable
CREATE TABLE "Consultation" (
    "id_consultation" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "motif" TEXT NOT NULL,
    "diagnostic" TEXT,
    "dossier_id" TEXT NOT NULL,
    "cree_par" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Consultation_pkey" PRIMARY KEY ("id_consultation")
);

-- CreateTable
CREATE TABLE "Prescription" (
    "id_prescription" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "instructions" TEXT,
    "dossier_id" TEXT NOT NULL,
    "medecin_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id_prescription")
);

-- CreateTable
CREATE TABLE "Medicament" (
    "id_medicament" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "dosage" TEXT,

    CONSTRAINT "Medicament_pkey" PRIMARY KEY ("id_medicament")
);

-- CreateTable
CREATE TABLE "PrescriptionMedicament" (
    "prescription_id" TEXT NOT NULL,
    "medicament_id" TEXT NOT NULL,

    CONSTRAINT "PrescriptionMedicament_pkey" PRIMARY KEY ("prescription_id","medicament_id")
);

-- CreateTable
CREATE TABLE "ObservationMedicale" (
    "id_observation" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "valeur" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "dossier_id" TEXT NOT NULL,
    "cree_par" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ObservationMedicale_pkey" PRIMARY KEY ("id_observation")
);

-- CreateTable
CREATE TABLE "AutorisationDossier" (
    "id_autorisation" TEXT NOT NULL,
    "lecture" BOOLEAN NOT NULL,
    "ajout" BOOLEAN NOT NULL,
    "modification" BOOLEAN NOT NULL,
    "suppression" BOOLEAN NOT NULL,
    "utilisateur_id" TEXT NOT NULL,
    "dossier_id" TEXT NOT NULL,

    CONSTRAINT "AutorisationDossier_pkey" PRIMARY KEY ("id_autorisation")
);

-- CreateTable
CREATE TABLE "AccesUrgence" (
    "id_acces" TEXT NOT NULL,
    "raison" TEXT NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_fin" TIMESTAMP(3) NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "utilisateur_id" TEXT NOT NULL,
    "dossier_id" TEXT NOT NULL,

    CONSTRAINT "AccesUrgence_pkey" PRIMARY KEY ("id_acces")
);

-- CreateTable
CREATE TABLE "JournalAudit" (
    "id_audit" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" "ActionAudit" NOT NULL,
    "entite" TEXT NOT NULL,
    "entite_id" TEXT NOT NULL,
    "ip" TEXT,
    "utilisateur_id" TEXT NOT NULL,

    CONSTRAINT "JournalAudit_pkey" PRIMARY KEY ("id_audit")
);

-- CreateTable
CREATE TABLE "FhirMapping" (
    "id_mapping" TEXT NOT NULL,
    "ressource_fhir" TEXT NOT NULL,
    "ressource_id" TEXT NOT NULL,
    "entite_interne" TEXT NOT NULL,
    "entite_id" TEXT NOT NULL,
    "dossier_id" TEXT,

    CONSTRAINT "FhirMapping_pkey" PRIMARY KEY ("id_mapping")
);

-- CreateTable
CREATE TABLE "CouvertureAssurance" (
    "id_couverture" TEXT NOT NULL,
    "type" "TypeAssurance" NOT NULL,
    "organisme" TEXT NOT NULL,
    "numero_assure" TEXT NOT NULL,
    "date_debut" TIMESTAMP(3),
    "date_fin" TIMESTAMP(3),
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "patient_id" TEXT NOT NULL,

    CONSTRAINT "CouvertureAssurance_pkey" PRIMARY KEY ("id_couverture")
);

-- CreateTable
CREATE TABLE "EchangeAssurance" (
    "id_echange" TEXT NOT NULL,
    "type_echange" "TypeEchange" NOT NULL,
    "statut" "StatutEchange" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requete" JSONB NOT NULL,
    "reponse" JSONB NOT NULL,
    "patient_id" TEXT NOT NULL,

    CONSTRAINT "EchangeAssurance_pkey" PRIMARY KEY ("id_echange")
);

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_email_key" ON "Utilisateur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_numero_assurance_key" ON "Patient"("numero_assurance");

-- CreateIndex
CREATE UNIQUE INDEX "DossierMedical_patient_id_key" ON "DossierMedical"("patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "AutorisationDossier_utilisateur_id_dossier_id_key" ON "AutorisationDossier"("utilisateur_id", "dossier_id");

-- AddForeignKey
ALTER TABLE "DossierMedical" ADD CONSTRAINT "DossierMedical_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patient"("id_patient") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_dossier_id_fkey" FOREIGN KEY ("dossier_id") REFERENCES "DossierMedical"("id_dossier") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_cree_par_fkey" FOREIGN KEY ("cree_par") REFERENCES "Utilisateur"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_dossier_id_fkey" FOREIGN KEY ("dossier_id") REFERENCES "DossierMedical"("id_dossier") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_medecin_id_fkey" FOREIGN KEY ("medecin_id") REFERENCES "Utilisateur"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescriptionMedicament" ADD CONSTRAINT "PrescriptionMedicament_prescription_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "Prescription"("id_prescription") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescriptionMedicament" ADD CONSTRAINT "PrescriptionMedicament_medicament_id_fkey" FOREIGN KEY ("medicament_id") REFERENCES "Medicament"("id_medicament") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObservationMedicale" ADD CONSTRAINT "ObservationMedicale_dossier_id_fkey" FOREIGN KEY ("dossier_id") REFERENCES "DossierMedical"("id_dossier") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObservationMedicale" ADD CONSTRAINT "ObservationMedicale_cree_par_fkey" FOREIGN KEY ("cree_par") REFERENCES "Utilisateur"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutorisationDossier" ADD CONSTRAINT "AutorisationDossier_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "Utilisateur"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutorisationDossier" ADD CONSTRAINT "AutorisationDossier_dossier_id_fkey" FOREIGN KEY ("dossier_id") REFERENCES "DossierMedical"("id_dossier") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccesUrgence" ADD CONSTRAINT "AccesUrgence_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "Utilisateur"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccesUrgence" ADD CONSTRAINT "AccesUrgence_dossier_id_fkey" FOREIGN KEY ("dossier_id") REFERENCES "DossierMedical"("id_dossier") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalAudit" ADD CONSTRAINT "JournalAudit_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "Utilisateur"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FhirMapping" ADD CONSTRAINT "FhirMapping_dossier_id_fkey" FOREIGN KEY ("dossier_id") REFERENCES "DossierMedical"("id_dossier") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouvertureAssurance" ADD CONSTRAINT "CouvertureAssurance_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patient"("id_patient") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EchangeAssurance" ADD CONSTRAINT "EchangeAssurance_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patient"("id_patient") ON DELETE RESTRICT ON UPDATE CASCADE;
