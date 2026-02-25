-- AlterTable
ALTER TABLE "AccesUrgence" ADD COLUMN     "carte_hopital" TEXT,
ADD COLUMN     "date_arrivee_hopital" TIMESTAMP(3),
ADD COLUMN     "date_ramassage" TIMESTAMP(3),
ADD COLUMN     "medications_notes" TEXT,
ADD COLUMN     "rapport_data" JSONB;

-- AlterTable
ALTER TABLE "DossierMedical" ADD COLUMN     "medecin_traitant_id" TEXT;

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "contact_urgence_lien" TEXT,
ADD COLUMN     "contact_urgence_nom" TEXT,
ADD COLUMN     "contact_urgence_telephone" TEXT,
ADD COLUMN     "pharmacie_adresse" TEXT,
ADD COLUMN     "pharmacie_nom" TEXT,
ADD COLUMN     "pharmacie_telephone" TEXT,
ADD COLUMN     "photo_url" TEXT,
ADD COLUMN     "poids_kg" DOUBLE PRECISION,
ADD COLUMN     "taille_cm" INTEGER;

-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN     "institution" TEXT,
ADD COLUMN     "numero_praticien" TEXT;

-- CreateTable
CREATE TABLE "CatalogMedicament" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,

    CONSTRAINT "CatalogMedicament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hospitalisation" (
    "id_hospitalisation" TEXT NOT NULL,
    "date_admission" TIMESTAMP(3) NOT NULL,
    "date_sortie" TIMESTAMP(3),
    "etablissement" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "motif" TEXT NOT NULL,
    "resume" TEXT NOT NULL,
    "medecin_traitant" TEXT,
    "dossier_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Hospitalisation_pkey" PRIMARY KEY ("id_hospitalisation")
);

-- CreateIndex
CREATE UNIQUE INDEX "CatalogMedicament_nom_key" ON "CatalogMedicament"("nom");

-- CreateIndex
CREATE INDEX "CatalogMedicament_nom_idx" ON "CatalogMedicament"("nom");

-- AddForeignKey
ALTER TABLE "DossierMedical" ADD CONSTRAINT "DossierMedical_medecin_traitant_id_fkey" FOREIGN KEY ("medecin_traitant_id") REFERENCES "Utilisateur"("id_utilisateur") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hospitalisation" ADD CONSTRAINT "Hospitalisation_dossier_id_fkey" FOREIGN KEY ("dossier_id") REFERENCES "DossierMedical"("id_dossier") ON DELETE RESTRICT ON UPDATE CASCADE;
