import { Role, Sexe } from "@prisma/client";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Début du seed Prisma...");

  // Nettoyage (ordre important pour les foreign keys)
  await prisma.hospitalisation.deleteMany();
  await prisma.autorisationDossier.deleteMany();
  await prisma.accesUrgence.deleteMany();
  await prisma.journalAudit.deleteMany();
  await prisma.prescriptionMedicament.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.observationMedicale.deleteMany();
  await prisma.consultation.deleteMany();
  await prisma.fhirMapping.deleteMany();
  await prisma.dossierMedical.deleteMany();
  await prisma.echangeAssurance.deleteMany();
  await prisma.couvertureAssurance.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.medicament.deleteMany();
  await prisma.utilisateur.deleteMany();
  console.log("🧹 Tables nettoyées");

  // ===============================
  // UTILISATEURS (professionnels)
  // ===============================
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const admin = await prisma.utilisateur.create({
    data: { email: "admin@sante-quebec.local", mot_de_passe: passwordHash, nom: "Gagnon", prenom: "Pierre", role: Role.ADMIN }
  });

  const drTremblay = await prisma.utilisateur.create({
    data: { email: "jean.tremblay@sante-quebec.local", mot_de_passe: passwordHash, nom: "Tremblay", prenom: "Jean", role: Role.MEDECIN_GENERAL }
  });

  const drLavoie = await prisma.utilisateur.create({
    data: { email: "sophie.lavoie@sante-quebec.local", mot_de_passe: passwordHash, nom: "Lavoie", prenom: "Sophie", role: Role.MEDECIN_SPECIALISTE }
  });

  const drChen = await prisma.utilisateur.create({
    data: { email: "david.chen@sante-quebec.local", mot_de_passe: passwordHash, nom: "Chen", prenom: "David", role: Role.MEDECIN_GENERAL }
  });

  const infRoy = await prisma.utilisateur.create({
    data: { email: "marie.roy@sante-quebec.local", mot_de_passe: passwordHash, nom: "Roy", prenom: "Marie", role: Role.INFIRMIER }
  });

  const infBouchard = await prisma.utilisateur.create({
    data: { email: "luc.bouchard@sante-quebec.local", mot_de_passe: passwordHash, nom: "Bouchard", prenom: "Luc", role: Role.INFIRMIER }
  });

  const pharmGirard = await prisma.utilisateur.create({
    data: { email: "anne.girard@sante-quebec.local", mot_de_passe: passwordHash, nom: "Girard", prenom: "Anne", role: Role.PHARMACIEN }
  });

  const ambPelletier = await prisma.utilisateur.create({
    data: { email: "marc.pelletier@sante-quebec.local", mot_de_passe: passwordHash, nom: "Pelletier", prenom: "Marc", role: Role.AMBULANCIER }
  });

  const medecins = [drTremblay, drLavoie, drChen];
  const infirmiers = [infRoy, infBouchard];

  console.log("✅ 8 utilisateurs professionnels créés");

  // ===============================
  // MÉDICAMENTS
  // ===============================
  const medicamentsData = [
    { nom: "Metformine", dosage: "500mg" },
    { nom: "Metformine", dosage: "850mg" },
    { nom: "Atorvastatine", dosage: "20mg" },
    { nom: "Atorvastatine", dosage: "40mg" },
    { nom: "Lisinopril", dosage: "10mg" },
    { nom: "Lisinopril", dosage: "20mg" },
    { nom: "Amlodipine", dosage: "5mg" },
    { nom: "Amlodipine", dosage: "10mg" },
    { nom: "Levothyroxine", dosage: "50mcg" },
    { nom: "Levothyroxine", dosage: "100mcg" },
    { nom: "Oméprazole", dosage: "20mg" },
    { nom: "Salbutamol", dosage: "100mcg/dose" },
    { nom: "Fluticasone", dosage: "250mcg" },
    { nom: "Warfarine", dosage: "5mg" },
    { nom: "Clopidogrel", dosage: "75mg" },
    { nom: "Ibuprofène", dosage: "400mg" },
    { nom: "Acétaminophène", dosage: "500mg" },
    { nom: "Amoxicilline", dosage: "500mg" },
    { nom: "Ciprofloxacine", dosage: "500mg" },
    { nom: "Prednisone", dosage: "5mg" },
    { nom: "Prednisone", dosage: "50mg" },
    { nom: "Insuline Glargine", dosage: "100UI/mL" },
    { nom: "Ramipril", dosage: "5mg" },
    { nom: "Hydrochlorothiazide", dosage: "25mg" },
    { nom: "Gabapentine", dosage: "300mg" },
    { nom: "Sertraline", dosage: "50mg" },
    { nom: "Escitalopram", dosage: "10mg" },
    { nom: "Pantoprazole", dosage: "40mg" },
    { nom: "Rosuvastatin", dosage: "10mg" },
    { nom: "Metoprolol", dosage: "50mg" },
  ];

  const medicaments: Record<string, { id_medicament: string; nom: string; dosage: string | null }> = {};
  for (const med of medicamentsData) {
    const created = await prisma.medicament.create({ data: med });
    medicaments[`${med.nom}_${med.dosage}`] = created;
  }
  console.log("✅ 30 médicaments créés");

  // ===============================
  // 20 PATIENTS FICTIFS QUÉBÉCOIS
  // ===============================
  const patientsData = [
    { nom: "Gagné", prenom: "Luc", date_naissance: new Date("1958-03-12"), sexe: Sexe.HOMME, numero_assurance: "GAGL58031201", telephone: "514-555-0101", adresse: "45 rue Saint-Denis, Montréal, QC H2X 1K4", taille_cm: 175, poids_kg: 89, contact_urgence_nom: "Gagné, Diane", contact_urgence_telephone: "514-555-0102", contact_urgence_lien: "Conjointe", pharmacie_nom: "Pharmaprix - Saint-Denis", pharmacie_telephone: "514-844-3001", pharmacie_adresse: "51 rue Saint-Denis, Montréal, QC H2X 1K5" },
    { nom: "Bélanger", prenom: "Suzanne", date_naissance: new Date("1965-07-24"), sexe: Sexe.FEMME, numero_assurance: "BELS65072401", telephone: "418-555-0202", adresse: "112 boulevard Laurier, Québec, QC G1V 2L8", taille_cm: 163, poids_kg: 72, contact_urgence_nom: "Bélanger, Marc", contact_urgence_telephone: "418-555-0203", contact_urgence_lien: "Fils", pharmacie_nom: "Jean Coutu - Place Laurier", pharmacie_telephone: "418-651-7890", pharmacie_adresse: "2700 boulevard Laurier, Québec, QC G1V 2L8" },
    { nom: "Côté", prenom: "Michel", date_naissance: new Date("1972-11-08"), sexe: Sexe.HOMME, numero_assurance: "COTM72110801", telephone: "819-555-0303", adresse: "8 rue King Ouest, Sherbrooke, QC J1H 1P7", taille_cm: 180, poids_kg: 84, contact_urgence_nom: "Côté, Anne-Marie", contact_urgence_telephone: "819-555-0304", contact_urgence_lien: "Conjointe", pharmacie_nom: "Uniprix - King Ouest", pharmacie_telephone: "819-563-2200", pharmacie_adresse: "12 rue King Ouest, Sherbrooke, QC J1H 1P8" },
    { nom: "Fortin", prenom: "Isabelle", date_naissance: new Date("1980-01-30"), sexe: Sexe.FEMME, numero_assurance: "FORI80013001", telephone: "450-555-0404", adresse: "234 chemin de Chambly, Longueuil, QC J4H 3L9", taille_cm: 168, poids_kg: 61, contact_urgence_nom: "Fortin, Richard", contact_urgence_telephone: "450-555-0405", contact_urgence_lien: "Pere", pharmacie_nom: "Pharmaprix - Chambly", pharmacie_telephone: "450-468-5500", pharmacie_adresse: "240 chemin de Chambly, Longueuil, QC J4H 3L9" },
    { nom: "Ouellet", prenom: "René", date_naissance: new Date("1945-09-17"), sexe: Sexe.HOMME, numero_assurance: "OUER45091701", telephone: "418-555-0505", adresse: "67 avenue Maguire, Sillery, QC G1T 1X5", taille_cm: 170, poids_kg: 78, contact_urgence_nom: "Ouellet, Claire", contact_urgence_telephone: "418-555-0506", contact_urgence_lien: "Fille", pharmacie_nom: "Jean Coutu - Maguire", pharmacie_telephone: "418-527-3400", pharmacie_adresse: "1190 avenue Maguire, Sillery, QC G1T 1Z3" },
    { nom: "Pelletier", prenom: "Céline", date_naissance: new Date("1953-12-02"), sexe: Sexe.FEMME, numero_assurance: "PELC53120201", telephone: "514-555-0606", adresse: "890 rue Sherbrooke Est, Montréal, QC H2L 1K8", taille_cm: 158, poids_kg: 67, contact_urgence_nom: "Pelletier, Jacques", contact_urgence_telephone: "514-555-0607", contact_urgence_lien: "Conjoint", pharmacie_nom: "Pharmaprix - Sherbrooke Est", pharmacie_telephone: "514-524-8800", pharmacie_adresse: "900 rue Sherbrooke Est, Montréal, QC H2L 1L2" },
    { nom: "Bouchard", prenom: "Yves", date_naissance: new Date("1968-06-15"), sexe: Sexe.HOMME, numero_assurance: "BOUY68061501", telephone: "418-555-0707", adresse: "23 rue Racine Est, Chicoutimi, QC G7H 1P8", taille_cm: 183, poids_kg: 95, contact_urgence_nom: "Bouchard, Sophie", contact_urgence_telephone: "418-555-0708", contact_urgence_lien: "Conjointe", pharmacie_nom: "Familiprix - Chicoutimi", pharmacie_telephone: "418-543-2211", pharmacie_adresse: "45 rue Racine Est, Chicoutimi, QC G7H 1R3" },
    { nom: "Morin", prenom: "Nathalie", date_naissance: new Date("1975-04-22"), sexe: Sexe.FEMME, numero_assurance: "MORN75042201", telephone: "819-555-0808", adresse: "156 boulevard des Forges, Trois-Rivières, QC G8T 5C2", taille_cm: 165, poids_kg: 63, contact_urgence_nom: "Morin, Pierre", contact_urgence_telephone: "819-555-0809", contact_urgence_lien: "Frere", pharmacie_nom: "Jean Coutu - Des Forges", pharmacie_telephone: "819-374-1500", pharmacie_adresse: "160 boulevard des Forges, Trois-Rivières, QC G8T 5C3" },
    { nom: "Lavoie", prenom: "André", date_naissance: new Date("1950-08-09"), sexe: Sexe.HOMME, numero_assurance: "LAVA50080901", telephone: "514-555-0909", adresse: "3400 avenue du Parc, Montréal, QC H2X 2H5", taille_cm: 172, poids_kg: 76, contact_urgence_nom: "Lavoie, Louise", contact_urgence_telephone: "514-555-0910", contact_urgence_lien: "Conjointe", pharmacie_nom: "Uniprix - Avenue du Parc", pharmacie_telephone: "514-272-3300", pharmacie_adresse: "3430 avenue du Parc, Montréal, QC H2X 2H5" },
    { nom: "Desjardins", prenom: "Julie", date_naissance: new Date("1988-02-14"), sexe: Sexe.FEMME, numero_assurance: "DESJ88021401", telephone: "450-555-1010", adresse: "78 rue Principale, Granby, QC J2G 2T4", taille_cm: 170, poids_kg: 63, contact_urgence_nom: "Desjardins, Martin", contact_urgence_telephone: "450-555-1011", contact_urgence_lien: "Conjoint", pharmacie_nom: "Brunet - Granby", pharmacie_telephone: "450-372-4455", pharmacie_adresse: "80 rue Principale, Granby, QC J2G 2T5" },
    { nom: "Tremblay", prenom: "Georges", date_naissance: new Date("1942-05-28"), sexe: Sexe.HOMME, numero_assurance: "TREG42052801", telephone: "418-555-1111", adresse: "14 rue de l'Église, Rimouski, QC G5L 1P4", taille_cm: 168, poids_kg: 71, contact_urgence_nom: "Tremblay, Monique", contact_urgence_telephone: "418-555-1112", contact_urgence_lien: "Fille", pharmacie_nom: "Familiprix - Rimouski", pharmacie_telephone: "418-723-5566", pharmacie_adresse: "20 rue de l'Évêché Ouest, Rimouski, QC G5L 4H4" },
    { nom: "Dubois", prenom: "Marie-Claire", date_naissance: new Date("1970-10-11"), sexe: Sexe.FEMME, numero_assurance: "DUBM70101101", telephone: "514-555-1212", adresse: "567 avenue Papineau, Montréal, QC H2K 4J5", taille_cm: 160, poids_kg: 58, contact_urgence_nom: "Dubois, François", contact_urgence_telephone: "514-555-1213", contact_urgence_lien: "Conjoint", pharmacie_nom: "Pharmaprix - Papineau", pharmacie_telephone: "514-521-7700", pharmacie_adresse: "575 avenue Papineau, Montréal, QC H2K 4J6" },
    { nom: "Lévesque", prenom: "Alain", date_naissance: new Date("1963-03-06"), sexe: Sexe.HOMME, numero_assurance: "LEVA63030601", telephone: "819-555-1313", adresse: "45 rue Wellington Nord, Gatineau, QC J8X 2H3", taille_cm: 178, poids_kg: 88, contact_urgence_nom: "Lévesque, Carole", contact_urgence_telephone: "819-555-1314", contact_urgence_lien: "Conjointe", pharmacie_nom: "Jean Coutu - Gatineau", pharmacie_telephone: "819-771-8800", pharmacie_adresse: "50 rue Wellington Nord, Gatineau, QC J8X 2H4" },
    { nom: "Bergeron", prenom: "Francine", date_naissance: new Date("1955-11-19"), sexe: Sexe.FEMME, numero_assurance: "BERF55111901", telephone: "418-555-1414", adresse: "201 avenue Cartier, Québec, QC G1R 3Y6", taille_cm: 155, poids_kg: 64, contact_urgence_nom: "Bergeron, Sylvie", contact_urgence_telephone: "418-555-1415", contact_urgence_lien: "Fille", pharmacie_nom: "Brunet - Cartier", pharmacie_telephone: "418-522-1199", pharmacie_adresse: "210 avenue Cartier, Québec, QC G1R 3Y7" },
    { nom: "Simard", prenom: "Patrick", date_naissance: new Date("1982-07-03"), sexe: Sexe.HOMME, numero_assurance: "SIMP82070301", telephone: "514-555-1515", adresse: "1100 rue de la Montagne, Montréal, QC H3G 1Z1", taille_cm: 185, poids_kg: 82, contact_urgence_nom: "Simard, Catherine", contact_urgence_telephone: "514-555-1516", contact_urgence_lien: "Conjointe", pharmacie_nom: "Pharmaprix - Sainte-Catherine", pharmacie_telephone: "514-866-2200", pharmacie_adresse: "1500 rue Sainte-Catherine Ouest, Montréal, QC H3G 1S6" },
    { nom: "Gauthier", prenom: "Hélène", date_naissance: new Date("1960-09-25"), sexe: Sexe.FEMME, numero_assurance: "GAUH60092501", telephone: "450-555-1616", adresse: "34 boulevard Sainte-Rose, Laval, QC H7L 1K7", taille_cm: 162, poids_kg: 70, contact_urgence_nom: "Gauthier, Paul", contact_urgence_telephone: "450-555-1617", contact_urgence_lien: "Conjoint", pharmacie_nom: "Jean Coutu - Sainte-Rose", pharmacie_telephone: "450-625-3300", pharmacie_adresse: "40 boulevard Sainte-Rose, Laval, QC H7L 1K8" },
    { nom: "Paquette", prenom: "Denis", date_naissance: new Date("1948-01-14"), sexe: Sexe.HOMME, numero_assurance: "PAQD48011401", telephone: "819-555-1717", adresse: "89 rue Principale, Magog, QC J1X 2A7", taille_cm: 174, poids_kg: 81, contact_urgence_nom: "Paquette, Lise", contact_urgence_telephone: "819-555-1718", contact_urgence_lien: "Conjointe", pharmacie_nom: "Uniprix - Magog", pharmacie_telephone: "819-843-4455", pharmacie_adresse: "95 rue Principale, Magog, QC J1X 2A8" },
    { nom: "Caron", prenom: "Manon", date_naissance: new Date("1978-12-07"), sexe: Sexe.FEMME, numero_assurance: "CARM78120701", telephone: "514-555-1818", adresse: "2200 rue Guy, Montréal, QC H3H 2M3", taille_cm: 167, poids_kg: 58, contact_urgence_nom: "Caron, Sylvain", contact_urgence_telephone: "514-555-1819", contact_urgence_lien: "Frere", pharmacie_nom: "Pharmaprix - Guy", pharmacie_telephone: "514-932-1100", pharmacie_adresse: "2210 rue Guy, Montréal, QC H3H 2M4" },
    { nom: "Nadeau", prenom: "Robert", date_naissance: new Date("1956-06-20"), sexe: Sexe.HOMME, numero_assurance: "NADR56062001", telephone: "418-555-1919", adresse: "156 Grande Allée Est, Québec, QC G1R 2H6", taille_cm: 176, poids_kg: 83, contact_urgence_nom: "Nadeau, Ginette", contact_urgence_telephone: "418-555-1920", contact_urgence_lien: "Conjointe", pharmacie_nom: "Jean Coutu - Grande Allée", pharmacie_telephone: "418-529-6677", pharmacie_adresse: "160 Grande Allée Est, Québec, QC G1R 2H7" },
    { nom: "Thibault", prenom: "Caroline", date_naissance: new Date("1990-04-16"), sexe: Sexe.FEMME, numero_assurance: "THIC90041601", telephone: "450-555-2020", adresse: "45 boulevard de Mortagne, Boucherville, QC J4B 5K5", taille_cm: 171, poids_kg: 60, contact_urgence_nom: "Thibault, Michel", contact_urgence_telephone: "450-555-2021", contact_urgence_lien: "Pere", pharmacie_nom: "Brunet - Boucherville", pharmacie_telephone: "450-449-2233", pharmacie_adresse: "50 boulevard de Mortagne, Boucherville, QC J4B 5K6" },
  ];

  const patients: { patient: typeof patientsData[0] & { id_patient: string }; dossier: { id_dossier: string } }[] = [];

  for (const p of patientsData) {
    const patient = await prisma.patient.create({ data: p });
    const dossier = await prisma.dossierMedical.create({
      data: { patient_id: patient.id_patient, etat: "ACTIF" }
    });
    patients.push({ patient: { ...p, id_patient: patient.id_patient }, dossier });
  }
  console.log("✅ 20 patients et dossiers créés");

  // ===============================
  // UTILISATEURS PATIENTS (comptes de connexion pour quelques patients)
  // ===============================
  const patientUsers = [];
  for (let i = 0; i < 5; i++) {
    const p = patients[i];
    const user = await prisma.utilisateur.create({
      data: {
        email: `${p.patient.prenom.toLowerCase()}.${p.patient.nom.toLowerCase()}@patient.local`,
        mot_de_passe: passwordHash,
        nom: p.patient.nom,
        prenom: p.patient.prenom,
        role: Role.PATIENT
      }
    });
    patientUsers.push(user);
    // Autorisation lecture seule sur son propre dossier
    await prisma.autorisationDossier.create({
      data: {
        utilisateur_id: user.id_utilisateur,
        dossier_id: p.dossier.id_dossier,
        lecture: true, ajout: false, modification: false, suppression: false
      }
    });
  }
  console.log("✅ 5 comptes patients créés");

  // ===============================
  // AUTORISATIONS (médecins & infirmiers sur les dossiers)
  // ===============================
  for (const p of patients) {
    // Dr Tremblay a accès à tous les dossiers
    await prisma.autorisationDossier.create({
      data: {
        utilisateur_id: drTremblay.id_utilisateur,
        dossier_id: p.dossier.id_dossier,
        lecture: true, ajout: true, modification: true, suppression: false
      }
    });
  }

  // Dr Lavoie (spécialiste) - 10 premiers patients
  for (let i = 0; i < 10; i++) {
    await prisma.autorisationDossier.create({
      data: {
        utilisateur_id: drLavoie.id_utilisateur,
        dossier_id: patients[i].dossier.id_dossier,
        lecture: true, ajout: true, modification: true, suppression: false
      }
    });
  }

  // Dr Chen - patients 8 à 19
  for (let i = 8; i < 20; i++) {
    await prisma.autorisationDossier.create({
      data: {
        utilisateur_id: drChen.id_utilisateur,
        dossier_id: patients[i].dossier.id_dossier,
        lecture: true, ajout: true, modification: true, suppression: false
      }
    });
  }

  // Infirmière Roy - tous les dossiers (lecture + ajout)
  for (const p of patients) {
    await prisma.autorisationDossier.create({
      data: {
        utilisateur_id: infRoy.id_utilisateur,
        dossier_id: p.dossier.id_dossier,
        lecture: true, ajout: true, modification: false, suppression: false
      }
    });
  }

  // Infirmier Bouchard - 10 derniers patients
  for (let i = 10; i < 20; i++) {
    await prisma.autorisationDossier.create({
      data: {
        utilisateur_id: infBouchard.id_utilisateur,
        dossier_id: patients[i].dossier.id_dossier,
        lecture: true, ajout: true, modification: false, suppression: false
      }
    });
  }

  // Pharmacienne Girard - lecture tous les dossiers
  for (const p of patients) {
    await prisma.autorisationDossier.create({
      data: {
        utilisateur_id: pharmGirard.id_utilisateur,
        dossier_id: p.dossier.id_dossier,
        lecture: true, ajout: false, modification: false, suppression: false
      }
    });
  }

  console.log("✅ Autorisations définies");

  // ===============================
  // CONSULTATIONS, OBSERVATIONS, PRESCRIPTIONS
  // ===============================

  // Pathologies par patient (index)
  const pathologies: { patientIdx: number; consultations: { date: Date; motif: string; diagnostic: string; medecin: typeof drTremblay }[]; observations: { type: string; valeur: string; date: Date; createur: typeof drTremblay }[]; prescriptions: { date: Date; instructions: string; medecin: typeof drTremblay; meds: string[] }[] }[] = [
    // 0 - Gagné, Luc (67 ans) - Diabète type 2 + HTA
    {
      patientIdx: 0,
      consultations: [
        { date: new Date("2025-06-15"), motif: "Suivi diabète type 2", diagnostic: "Diabète type 2 contrôlé - HbA1c à 7.2%", medecin: drTremblay },
        { date: new Date("2025-09-20"), motif: "Contrôle tension artérielle", diagnostic: "Hypertension artérielle stade 1 - ajustement traitement", medecin: drTremblay },
        { date: new Date("2026-01-10"), motif: "Suivi annuel diabète", diagnostic: "HbA1c améliorée à 6.8% - continuer traitement actuel", medecin: drTremblay },
      ],
      observations: [
        { type: "Glycémie à jeun", valeur: "7.8 mmol/L", date: new Date("2025-06-15"), createur: infRoy },
        { type: "Tension artérielle", valeur: "148/92 mmHg", date: new Date("2025-09-20"), createur: infRoy },
        { type: "HbA1c", valeur: "6.8%", date: new Date("2026-01-10"), createur: infRoy },
        { type: "Poids", valeur: "89 kg", date: new Date("2026-01-10"), createur: infRoy },
      ],
      prescriptions: [
        { date: new Date("2025-06-15"), instructions: "Metformine 500mg 2x/jour avec repas. Contrôle glycémie quotidien.", medecin: drTremblay, meds: ["Metformine_500mg"] },
        { date: new Date("2025-09-20"), instructions: "Ajouter Lisinopril 10mg 1x/jour le matin pour HTA.", medecin: drTremblay, meds: ["Metformine_500mg", "Lisinopril_10mg"] },
      ]
    },
    // 1 - Bélanger, Suzanne (60 ans) - Hypothyroïdie + Dépression
    {
      patientIdx: 1,
      consultations: [
        { date: new Date("2025-05-10"), motif: "Fatigue persistante et prise de poids", diagnostic: "Hypothyroïdie - TSH élevée à 12.5 mUI/L", medecin: drLavoie },
        { date: new Date("2025-08-22"), motif: "Suivi thyroïde + humeur dépressive", diagnostic: "TSH normalisée. Épisode dépressif majeur léger.", medecin: drLavoie },
        { date: new Date("2025-12-05"), motif: "Suivi dépression", diagnostic: "Amélioration significative de l'humeur sous ISRS", medecin: drLavoie },
      ],
      observations: [
        { type: "TSH", valeur: "12.5 mUI/L", date: new Date("2025-05-10"), createur: infRoy },
        { type: "T4 libre", valeur: "8.2 pmol/L", date: new Date("2025-05-10"), createur: infRoy },
        { type: "TSH", valeur: "3.8 mUI/L", date: new Date("2025-08-22"), createur: infRoy },
        { type: "Poids", valeur: "72 kg", date: new Date("2025-08-22"), createur: infRoy },
      ],
      prescriptions: [
        { date: new Date("2025-05-10"), instructions: "Levothyroxine 50mcg à jeun, 30 min avant déjeuner.", medecin: drLavoie, meds: ["Levothyroxine_50mcg"] },
        { date: new Date("2025-08-22"), instructions: "Ajouter Sertraline 50mg 1x/jour. Augmenter Levothyroxine à 100mcg.", medecin: drLavoie, meds: ["Levothyroxine_100mcg", "Sertraline_50mg"] },
      ]
    },
    // 2 - Côté, Michel (53 ans) - Asthme + RGO
    {
      patientIdx: 2,
      consultations: [
        { date: new Date("2025-04-18"), motif: "Dyspnée d'effort et toux nocturne", diagnostic: "Asthme modéré persistant", medecin: drTremblay },
        { date: new Date("2025-07-30"), motif: "Brûlures épigastriques", diagnostic: "Reflux gastro-oesophagien (RGO)", medecin: drTremblay },
        { date: new Date("2025-11-15"), motif: "Suivi asthme et RGO", diagnostic: "Asthme bien contrôlé. RGO amélioré sous IPP.", medecin: drTremblay },
      ],
      observations: [
        { type: "VEMS", valeur: "72% de la valeur prédite", date: new Date("2025-04-18"), createur: infRoy },
        { type: "Saturation O2", valeur: "96%", date: new Date("2025-04-18"), createur: infRoy },
        { type: "VEMS", valeur: "85% de la valeur prédite", date: new Date("2025-11-15"), createur: infRoy },
      ],
      prescriptions: [
        { date: new Date("2025-04-18"), instructions: "Salbutamol PRN + Fluticasone 250mcg 2x/jour.", medecin: drTremblay, meds: ["Salbutamol_100mcg/dose", "Fluticasone_250mcg"] },
        { date: new Date("2025-07-30"), instructions: "Oméprazole 20mg 1x/jour avant déjeuner x 8 semaines.", medecin: drTremblay, meds: ["Oméprazole_20mg"] },
      ]
    },
    // 3 - Fortin, Isabelle (46 ans) - Migraine + Anxiété
    {
      patientIdx: 3,
      consultations: [
        { date: new Date("2025-03-05"), motif: "Céphalées récurrentes avec aura", diagnostic: "Migraine avec aura - 4-5 épisodes/mois", medecin: drLavoie },
        { date: new Date("2025-07-12"), motif: "Anxiété généralisée, insomnie", diagnostic: "Trouble d'anxiété généralisée", medecin: drLavoie },
      ],
      observations: [
        { type: "Tension artérielle", valeur: "122/78 mmHg", date: new Date("2025-03-05"), createur: infRoy },
        { type: "Fréquence migraines", valeur: "4-5 épisodes/mois", date: new Date("2025-03-05"), createur: drLavoie },
        { type: "Score GAD-7", valeur: "14/21 (modéré)", date: new Date("2025-07-12"), createur: drLavoie },
      ],
      prescriptions: [
        { date: new Date("2025-07-12"), instructions: "Escitalopram 10mg 1x/jour le matin.", medecin: drLavoie, meds: ["Escitalopram_10mg"] },
      ]
    },
    // 4 - Ouellet, René (80 ans) - Insuffisance cardiaque + Fibrillation auriculaire
    {
      patientIdx: 4,
      consultations: [
        { date: new Date("2025-02-20"), motif: "Essoufflement progressif et oedème des MI", diagnostic: "Insuffisance cardiaque congestive NYHA classe II", medecin: drLavoie },
        { date: new Date("2025-05-14"), motif: "Palpitations irrégulières", diagnostic: "Fibrillation auriculaire paroxystique", medecin: drLavoie },
        { date: new Date("2025-08-30"), motif: "Suivi cardiaque", diagnostic: "IC stable, FA bien contrôlée sous traitement", medecin: drLavoie },
        { date: new Date("2025-12-18"), motif: "Suivi semestriel", diagnostic: "État stable. Maintenir traitement actuel.", medecin: drLavoie },
      ],
      observations: [
        { type: "Tension artérielle", valeur: "135/82 mmHg", date: new Date("2025-02-20"), createur: infRoy },
        { type: "Fréquence cardiaque", valeur: "88 bpm irrégulier", date: new Date("2025-05-14"), createur: infRoy },
        { type: "Poids", valeur: "78 kg", date: new Date("2025-08-30"), createur: infRoy },
        { type: "BNP", valeur: "450 pg/mL", date: new Date("2025-02-20"), createur: infRoy },
        { type: "INR", valeur: "2.3", date: new Date("2025-12-18"), createur: infRoy },
      ],
      prescriptions: [
        { date: new Date("2025-02-20"), instructions: "Ramipril 5mg 1x/jour + Hydrochlorothiazide 25mg 1x/jour. Peser chaque matin.", medecin: drLavoie, meds: ["Ramipril_5mg", "Hydrochlorothiazide_25mg"] },
        { date: new Date("2025-05-14"), instructions: "Ajouter Warfarine 5mg. INR cible 2.0-3.0. Contrôle INR hebdomadaire.", medecin: drLavoie, meds: ["Warfarine_5mg", "Metoprolol_50mg"] },
      ]
    },
    // 5 - Pelletier, Céline (72 ans) - Arthrose + Ostéoporose
    {
      patientIdx: 5,
      consultations: [
        { date: new Date("2025-04-02"), motif: "Douleurs aux genoux bilatérales", diagnostic: "Gonarthrose bilatérale modérée", medecin: drTremblay },
        { date: new Date("2025-10-08"), motif: "Résultats ostéodensitométrie", diagnostic: "Ostéoporose lombaire T-score -2.8", medecin: drTremblay },
      ],
      observations: [
        { type: "EVA douleur", valeur: "6/10", date: new Date("2025-04-02"), createur: drTremblay },
        { type: "T-score lombaire", valeur: "-2.8", date: new Date("2025-10-08"), createur: drTremblay },
        { type: "Vitamine D", valeur: "42 nmol/L (insuffisant)", date: new Date("2025-10-08"), createur: infRoy },
      ],
      prescriptions: [
        { date: new Date("2025-04-02"), instructions: "Acétaminophène 500mg 3x/jour PRN. Ibuprofène 400mg en cas de poussée inflammatoire (max 5 jours).", medecin: drTremblay, meds: ["Acétaminophène_500mg", "Ibuprofène_400mg"] },
      ]
    },
    // 6 - Bouchard, Yves (57 ans) - Dyslipidémie + Stéatose hépatique
    {
      patientIdx: 6,
      consultations: [
        { date: new Date("2025-05-22"), motif: "Bilan lipidique anormal", diagnostic: "Dyslipidémie mixte - LDL 4.2, TG 3.1", medecin: drTremblay },
        { date: new Date("2025-11-28"), motif: "Suivi lipides + échographie", diagnostic: "Stéatose hépatique non alcoolique. Lipides améliorés.", medecin: drTremblay },
      ],
      observations: [
        { type: "Cholestérol total", valeur: "6.8 mmol/L", date: new Date("2025-05-22"), createur: infRoy },
        { type: "LDL", valeur: "4.2 mmol/L", date: new Date("2025-05-22"), createur: infRoy },
        { type: "Triglycérides", valeur: "3.1 mmol/L", date: new Date("2025-05-22"), createur: infRoy },
        { type: "ALT", valeur: "58 U/L", date: new Date("2025-11-28"), createur: infRoy },
        { type: "LDL", valeur: "2.8 mmol/L", date: new Date("2025-11-28"), createur: infRoy },
      ],
      prescriptions: [
        { date: new Date("2025-05-22"), instructions: "Atorvastatine 40mg 1x/jour au coucher. Diète faible en gras saturés.", medecin: drTremblay, meds: ["Atorvastatine_40mg"] },
      ]
    },
    // 7 - Morin, Nathalie (50 ans) - Infection urinaire récurrente
    {
      patientIdx: 7,
      consultations: [
        { date: new Date("2025-06-05"), motif: "Dysurie et pollakiurie", diagnostic: "Cystite aiguë non compliquée", medecin: drChen },
        { date: new Date("2025-10-12"), motif: "Récidive infection urinaire", diagnostic: "3e épisode en 6 mois - investigation recommandée", medecin: drChen },
      ],
      observations: [
        { type: "Analyse urinaire", valeur: "Leucocytes +++, Nitrites +", date: new Date("2025-06-05"), createur: infRoy },
        { type: "Culture urinaire", valeur: "E. coli >10^5 UFC/mL", date: new Date("2025-06-05"), createur: infRoy },
        { type: "Température", valeur: "37.8°C", date: new Date("2025-10-12"), createur: infRoy },
      ],
      prescriptions: [
        { date: new Date("2025-06-05"), instructions: "Ciprofloxacine 500mg 2x/jour x 3 jours.", medecin: drChen, meds: ["Ciprofloxacine_500mg"] },
        { date: new Date("2025-10-12"), instructions: "Amoxicilline 500mg 3x/jour x 7 jours selon antibiogramme.", medecin: drChen, meds: ["Amoxicilline_500mg"] },
      ]
    },
    // 8 - Lavoie, André (75 ans) - MPOC + Diabète type 2
    {
      patientIdx: 8,
      consultations: [
        { date: new Date("2025-03-18"), motif: "Toux productive chronique, dyspnée", diagnostic: "MPOC stade GOLD II", medecin: drChen },
        { date: new Date("2025-07-25"), motif: "Glycémie élevée au bilan", diagnostic: "Diabète type 2 nouvellement diagnostiqué", medecin: drChen },
        { date: new Date("2025-12-02"), motif: "Exacerbation MPOC", diagnostic: "Exacerbation infectieuse de MPOC - antibiotiques + corticostéroïdes", medecin: drChen },
      ],
      observations: [
        { type: "VEMS", valeur: "58% de la valeur prédite", date: new Date("2025-03-18"), createur: infBouchard },
        { type: "Saturation O2", valeur: "93%", date: new Date("2025-03-18"), createur: infBouchard },
        { type: "HbA1c", valeur: "7.9%", date: new Date("2025-07-25"), createur: infBouchard },
        { type: "Glycémie à jeun", valeur: "9.2 mmol/L", date: new Date("2025-07-25"), createur: infBouchard },
        { type: "Saturation O2", valeur: "89%", date: new Date("2025-12-02"), createur: infBouchard },
      ],
      prescriptions: [
        { date: new Date("2025-03-18"), instructions: "Salbutamol PRN. Consultation pneumologie à planifier.", medecin: drChen, meds: ["Salbutamol_100mcg/dose"] },
        { date: new Date("2025-07-25"), instructions: "Metformine 850mg 2x/jour. Glucomètre et contrôle quotidien.", medecin: drChen, meds: ["Metformine_850mg"] },
        { date: new Date("2025-12-02"), instructions: "Amoxicilline 500mg 3x/jour x 7 jours + Prednisone 50mg x 5 jours puis sevrage.", medecin: drChen, meds: ["Amoxicilline_500mg", "Prednisone_50mg"] },
      ]
    },
    // 9 - Desjardins, Julie (37 ans) - Grossesse (suivi)
    {
      patientIdx: 9,
      consultations: [
        { date: new Date("2025-09-01"), motif: "Première visite prénatale", diagnostic: "Grossesse 8 semaines confirmée - G1P0", medecin: drTremblay },
        { date: new Date("2025-11-10"), motif: "Suivi prénatal 2e trimestre", diagnostic: "Grossesse évolutive normale - 18 semaines", medecin: drTremblay },
        { date: new Date("2026-01-20"), motif: "Suivi prénatal 3e trimestre", diagnostic: "28 semaines - dépistage diabète gestationnel négatif", medecin: drTremblay },
      ],
      observations: [
        { type: "Tension artérielle", valeur: "115/72 mmHg", date: new Date("2025-09-01"), createur: infRoy },
        { type: "Poids", valeur: "63 kg", date: new Date("2025-09-01"), createur: infRoy },
        { type: "Poids", valeur: "68 kg", date: new Date("2025-11-10"), createur: infRoy },
        { type: "HGPO 50g", valeur: "6.2 mmol/L (normal)", date: new Date("2026-01-20"), createur: infRoy },
        { type: "Hémoglobine", valeur: "118 g/L", date: new Date("2026-01-20"), createur: infRoy },
      ],
      prescriptions: []
    },
    // 10 - Tremblay, Georges (83 ans) - Alzheimer léger + HTA
    {
      patientIdx: 10,
      consultations: [
        { date: new Date("2025-04-10"), motif: "Troubles de mémoire progressifs", diagnostic: "Maladie d'Alzheimer stade léger - MoCA 21/30", medecin: drLavoie },
        { date: new Date("2025-10-15"), motif: "Suivi cognitif", diagnostic: "Stabilisation sous traitement. MoCA 20/30.", medecin: drLavoie },
      ],
      observations: [
        { type: "Score MoCA", valeur: "21/30", date: new Date("2025-04-10"), createur: drLavoie },
        { type: "Tension artérielle", valeur: "142/88 mmHg", date: new Date("2025-04-10"), createur: infBouchard },
        { type: "Score MoCA", valeur: "20/30", date: new Date("2025-10-15"), createur: drLavoie },
        { type: "Poids", valeur: "71 kg", date: new Date("2025-10-15"), createur: infBouchard },
      ],
      prescriptions: [
        { date: new Date("2025-04-10"), instructions: "Amlodipine 5mg 1x/jour pour HTA.", medecin: drLavoie, meds: ["Amlodipine_5mg"] },
      ]
    },
    // 11 - Dubois, Marie-Claire (55 ans) - Polyarthrite rhumatoïde
    {
      patientIdx: 11,
      consultations: [
        { date: new Date("2025-05-30"), motif: "Douleurs articulaires symétriques aux mains", diagnostic: "Polyarthrite rhumatoïde séropositive (FR+, anti-CCP+)", medecin: drLavoie },
        { date: new Date("2025-09-18"), motif: "Suivi PAR sous traitement", diagnostic: "Amélioration partielle. DAS28 = 3.8 (activité modérée).", medecin: drLavoie },
      ],
      observations: [
        { type: "Facteur rhumatoïde", valeur: "78 UI/mL (positif)", date: new Date("2025-05-30"), createur: infRoy },
        { type: "Anti-CCP", valeur: "156 U/mL (positif)", date: new Date("2025-05-30"), createur: infRoy },
        { type: "VS", valeur: "42 mm/h", date: new Date("2025-05-30"), createur: infRoy },
        { type: "CRP", valeur: "18 mg/L", date: new Date("2025-05-30"), createur: infRoy },
        { type: "DAS28", valeur: "3.8", date: new Date("2025-09-18"), createur: drLavoie },
      ],
      prescriptions: [
        { date: new Date("2025-05-30"), instructions: "Prednisone 5mg 1x/jour en attendant effet du traitement de fond.", medecin: drLavoie, meds: ["Prednisone_5mg"] },
      ]
    },
    // 12 - Lévesque, Alain (62 ans) - Lombalgie chronique + Neuropathie
    {
      patientIdx: 12,
      consultations: [
        { date: new Date("2025-06-20"), motif: "Lombalgie chronique irradiant à la jambe droite", diagnostic: "Hernie discale L4-L5 avec radiculopathie", medecin: drChen },
        { date: new Date("2025-10-25"), motif: "Engourdissements pieds bilatéraux", diagnostic: "Neuropathie périphérique à investiguer - bilan demandé", medecin: drChen },
      ],
      observations: [
        { type: "EVA douleur", valeur: "7/10", date: new Date("2025-06-20"), createur: drChen },
        { type: "Test Lasègue", valeur: "Positif à droite à 40°", date: new Date("2025-06-20"), createur: drChen },
        { type: "Glycémie à jeun", valeur: "6.1 mmol/L", date: new Date("2025-10-25"), createur: infBouchard },
      ],
      prescriptions: [
        { date: new Date("2025-06-20"), instructions: "Acétaminophène 500mg aux 6h PRN. Ibuprofène 400mg 3x/jour x 10 jours.", medecin: drChen, meds: ["Acétaminophène_500mg", "Ibuprofène_400mg"] },
        { date: new Date("2025-10-25"), instructions: "Gabapentine 300mg au coucher, augmenter progressivement.", medecin: drChen, meds: ["Gabapentine_300mg"] },
      ]
    },
    // 13 - Bergeron, Francine (70 ans) - Fibrillation auriculaire + Dyslipidémie
    {
      patientIdx: 13,
      consultations: [
        { date: new Date("2025-03-28"), motif: "Palpitations intermittentes depuis 2 mois", diagnostic: "Fibrillation auriculaire persistante - CHA2DS2-VASc = 4", medecin: drChen },
        { date: new Date("2025-08-15"), motif: "Suivi FA + bilan lipidique", diagnostic: "FA contrôlée. Dyslipidémie découverte au bilan.", medecin: drChen },
      ],
      observations: [
        { type: "Fréquence cardiaque", valeur: "92 bpm irrégulier", date: new Date("2025-03-28"), createur: infBouchard },
        { type: "Tension artérielle", valeur: "138/85 mmHg", date: new Date("2025-03-28"), createur: infBouchard },
        { type: "LDL", valeur: "3.6 mmol/L", date: new Date("2025-08-15"), createur: infBouchard },
        { type: "INR", valeur: "2.1", date: new Date("2025-08-15"), createur: infBouchard },
      ],
      prescriptions: [
        { date: new Date("2025-03-28"), instructions: "Warfarine 5mg 1x/jour. Cible INR 2.0-3.0. Metoprolol 50mg 2x/jour.", medecin: drChen, meds: ["Warfarine_5mg", "Metoprolol_50mg"] },
        { date: new Date("2025-08-15"), instructions: "Ajouter Rosuvastatin 10mg 1x/jour au coucher.", medecin: drChen, meds: ["Rosuvastatin_10mg"] },
      ]
    },
    // 14 - Simard, Patrick (43 ans) - Ulcère gastrique
    {
      patientIdx: 14,
      consultations: [
        { date: new Date("2025-07-08"), motif: "Douleurs épigastriques post-prandiales depuis 3 semaines", diagnostic: "Ulcère gastrique H. pylori positif", medecin: drTremblay },
        { date: new Date("2025-10-02"), motif: "Contrôle post-traitement H. pylori", diagnostic: "Test respiratoire négatif. Guérison de l'ulcère.", medecin: drTremblay },
      ],
      observations: [
        { type: "Test H. pylori", valeur: "Positif (test respiratoire)", date: new Date("2025-07-08"), createur: infRoy },
        { type: "Hémoglobine", valeur: "128 g/L", date: new Date("2025-07-08"), createur: infRoy },
        { type: "Test H. pylori contrôle", valeur: "Négatif", date: new Date("2025-10-02"), createur: infRoy },
      ],
      prescriptions: [
        { date: new Date("2025-07-08"), instructions: "Pantoprazole 40mg 2x/jour + Amoxicilline 500mg 2x/jour x 14 jours (trithérapie).", medecin: drTremblay, meds: ["Pantoprazole_40mg", "Amoxicilline_500mg"] },
      ]
    },
    // 15 - Gauthier, Hélène (65 ans) - HTA + Hypercholestérolémie
    {
      patientIdx: 15,
      consultations: [
        { date: new Date("2025-04-25"), motif: "Bilan de santé annuel", diagnostic: "HTA stade 1 et hypercholestérolémie", medecin: drChen },
        { date: new Date("2025-11-05"), motif: "Suivi HTA et lipides", diagnostic: "Tension normalisée sous traitement. LDL à cible.", medecin: drChen },
      ],
      observations: [
        { type: "Tension artérielle", valeur: "152/94 mmHg", date: new Date("2025-04-25"), createur: infBouchard },
        { type: "Cholestérol total", valeur: "6.2 mmol/L", date: new Date("2025-04-25"), createur: infBouchard },
        { type: "LDL", valeur: "3.9 mmol/L", date: new Date("2025-04-25"), createur: infBouchard },
        { type: "Tension artérielle", valeur: "128/82 mmHg", date: new Date("2025-11-05"), createur: infBouchard },
        { type: "LDL", valeur: "2.4 mmol/L", date: new Date("2025-11-05"), createur: infBouchard },
      ],
      prescriptions: [
        { date: new Date("2025-04-25"), instructions: "Amlodipine 10mg 1x/jour + Atorvastatine 20mg au coucher.", medecin: drChen, meds: ["Amlodipine_10mg", "Atorvastatine_20mg"] },
      ]
    },
    // 16 - Paquette, Denis (77 ans) - Diabète type 2 insulino-requérant + Neuropathie diabétique
    {
      patientIdx: 16,
      consultations: [
        { date: new Date("2025-03-12"), motif: "HbA1c en hausse malgré Metformine maximale", diagnostic: "Diabète type 2 nécessitant insulinothérapie - HbA1c 9.1%", medecin: drTremblay },
        { date: new Date("2025-06-28"), motif: "Paresthésies pieds bilatérales", diagnostic: "Neuropathie diabétique périphérique", medecin: drTremblay },
        { date: new Date("2025-12-10"), motif: "Suivi diabète", diagnostic: "HbA1c améliorée à 7.5% sous insuline + Metformine", medecin: drTremblay },
      ],
      observations: [
        { type: "HbA1c", valeur: "9.1%", date: new Date("2025-03-12"), createur: infRoy },
        { type: "Créatinine", valeur: "125 umol/L", date: new Date("2025-03-12"), createur: infRoy },
        { type: "Test monofilament", valeur: "Diminué bilatéralement", date: new Date("2025-06-28"), createur: infRoy },
        { type: "HbA1c", valeur: "7.5%", date: new Date("2025-12-10"), createur: infRoy },
      ],
      prescriptions: [
        { date: new Date("2025-03-12"), instructions: "Insuline Glargine 14 unités au coucher. Maintenir Metformine 850mg 2x/jour. Auto-surveillance glycémique 2x/jour.", medecin: drTremblay, meds: ["Insuline Glargine_100UI/mL", "Metformine_850mg"] },
        { date: new Date("2025-06-28"), instructions: "Gabapentine 300mg 3x/jour pour neuropathie.", medecin: drTremblay, meds: ["Gabapentine_300mg"] },
      ]
    },
    // 17 - Caron, Manon (47 ans) - Dépression majeure + Insomnie
    {
      patientIdx: 17,
      consultations: [
        { date: new Date("2025-05-15"), motif: "Humeur dépressive, perte d'intérêt, insomnie depuis 2 mois", diagnostic: "Épisode dépressif majeur modéré - PHQ-9: 16/27", medecin: drChen },
        { date: new Date("2025-08-20"), motif: "Suivi dépression", diagnostic: "Amélioration partielle PHQ-9: 10/27. Ajustement posologie.", medecin: drChen },
        { date: new Date("2026-01-15"), motif: "Suivi 6 mois", diagnostic: "Rémission. PHQ-9: 4/27. Maintenir traitement 6 mois additionnels.", medecin: drChen },
      ],
      observations: [
        { type: "Score PHQ-9", valeur: "16/27 (modérément sévère)", date: new Date("2025-05-15"), createur: drChen },
        { type: "Poids", valeur: "58 kg", date: new Date("2025-05-15"), createur: infBouchard },
        { type: "Score PHQ-9", valeur: "10/27 (modéré)", date: new Date("2025-08-20"), createur: drChen },
        { type: "Score PHQ-9", valeur: "4/27 (minimal)", date: new Date("2026-01-15"), createur: drChen },
      ],
      prescriptions: [
        { date: new Date("2025-05-15"), instructions: "Sertraline 50mg 1x/jour le matin.", medecin: drChen, meds: ["Sertraline_50mg"] },
      ]
    },
    // 18 - Nadeau, Robert (69 ans) - Maladie coronarienne + Post-infarctus
    {
      patientIdx: 18,
      consultations: [
        { date: new Date("2025-02-05"), motif: "Suivi post-infarctus du myocarde (nov 2024)", diagnostic: "Post-IDM antérieur - FEVG 45% - réadaptation cardiaque en cours", medecin: drLavoie },
        { date: new Date("2025-06-12"), motif: "Suivi cardiologie 6 mois", diagnostic: "FEVG améliorée à 50%. Bonne tolérance à l'effort.", medecin: drLavoie },
        { date: new Date("2025-12-20"), motif: "Suivi annuel post-IDM", diagnostic: "État stable. Facteurs de risque bien contrôlés.", medecin: drLavoie },
      ],
      observations: [
        { type: "FEVG", valeur: "45%", date: new Date("2025-02-05"), createur: drLavoie },
        { type: "Tension artérielle", valeur: "125/78 mmHg", date: new Date("2025-02-05"), createur: infRoy },
        { type: "LDL", valeur: "1.8 mmol/L", date: new Date("2025-06-12"), createur: infRoy },
        { type: "FEVG", valeur: "50%", date: new Date("2025-06-12"), createur: drLavoie },
        { type: "Tension artérielle", valeur: "118/72 mmHg", date: new Date("2025-12-20"), createur: infRoy },
      ],
      prescriptions: [
        { date: new Date("2025-02-05"), instructions: "Clopidogrel 75mg 1x/jour (12 mois post-stent). Atorvastatine 40mg. Ramipril 5mg. Metoprolol 50mg 2x/jour.", medecin: drLavoie, meds: ["Clopidogrel_75mg", "Atorvastatine_40mg", "Ramipril_5mg", "Metoprolol_50mg"] },
      ]
    },
    // 19 - Thibault, Caroline (35 ans) - Asthme léger
    {
      patientIdx: 19,
      consultations: [
        { date: new Date("2025-08-05"), motif: "Toux et sifflement à l'effort depuis printemps", diagnostic: "Asthme léger intermittent - probablement allergique", medecin: drChen },
      ],
      observations: [
        { type: "VEMS", valeur: "88% de la valeur prédite", date: new Date("2025-08-05"), createur: infBouchard },
        { type: "Saturation O2", valeur: "98%", date: new Date("2025-08-05"), createur: infBouchard },
        { type: "Test de réversibilité", valeur: "Positif (+14% post-salbutamol)", date: new Date("2025-08-05"), createur: infBouchard },
      ],
      prescriptions: [
        { date: new Date("2025-08-05"), instructions: "Salbutamol 100mcg 2 inhalations PRN avant effort ou lors de symptômes.", medecin: drChen, meds: ["Salbutamol_100mcg/dose"] },
      ]
    },
  ];

  // Créer consultations, observations et prescriptions
  for (const patho of pathologies) {
    const dossierId = patients[patho.patientIdx].dossier.id_dossier;

    for (const c of patho.consultations) {
      await prisma.consultation.create({
        data: {
          date: c.date,
          motif: c.motif,
          diagnostic: c.diagnostic,
          dossier_id: dossierId,
          cree_par: c.medecin.id_utilisateur,
        }
      });
    }

    for (const o of patho.observations) {
      await prisma.observationMedicale.create({
        data: {
          type: o.type,
          valeur: o.valeur,
          date: o.date,
          dossier_id: dossierId,
          cree_par: o.createur.id_utilisateur,
        }
      });
    }

    for (const p of patho.prescriptions) {
      const prescription = await prisma.prescription.create({
        data: {
          date: p.date,
          instructions: p.instructions,
          dossier_id: dossierId,
          medecin_id: p.medecin.id_utilisateur,
        }
      });

      for (const medKey of p.meds) {
        const med = medicaments[medKey];
        if (med) {
          await prisma.prescriptionMedicament.create({
            data: {
              prescription_id: prescription.id_prescription,
              medicament_id: med.id_medicament,
            }
          });
        }
      }
    }
  }

  console.log("✅ Consultations, observations et prescriptions créées");

  // ===============================
  // HOSPITALISATIONS
  // ===============================
  const hospitalisationsData = [
    // Ouellet, René (80 ans) - IC + FA
    { patientIdx: 4, date_admission: new Date("2023-11-05"), date_sortie: new Date("2023-11-12"), etablissement: "CHUL - CHU de Québec", service: "Cardiologie", motif: "Décompensation cardiaque aiguë", resume: "Patient admis pour dyspnée sévère au repos et oedème des membres inférieurs bilatéral. Diagnostic: décompensation d'insuffisance cardiaque congestive sur fibrillation auriculaire rapide. Traitement: furosémide IV, contrôle de la fréquence par bêta-bloquant. Échocardiographie: FEVG 35%, dilatation auriculaire gauche. Anticoagulation débutée par warfarine. Évolution favorable avec perte de 5 kg en eau. Congé avec suivi cardiologie en externe.", medecin_traitant: "Dre Sophie Lavoie" },
    { patientIdx: 4, date_admission: new Date("2024-06-18"), date_sortie: new Date("2024-06-22"), etablissement: "CHUL - CHU de Québec", service: "Cardiologie", motif: "Fibrillation auriculaire rapide symptomatique", resume: "Admission pour palpitations et lipothymies. FC à l'arrivée 145 bpm. Cardioversion pharmacologique par amiodarone IV. Retour en rythme sinusal après 48h. Ajustement du traitement: ajout de digoxine. INR sous-thérapeutique à 1.4 - ajustement warfarine. Congé avec Holter prévu en externe.", medecin_traitant: "Dre Sophie Lavoie" },
    // Lavoie, André (75 ans) - MPOC
    { patientIdx: 8, date_admission: new Date("2024-02-10"), date_sortie: new Date("2024-02-18"), etablissement: "Hôpital Notre-Dame (CHUM)", service: "Pneumologie", motif: "Exacerbation sévère de MPOC", resume: "Patient admis pour détresse respiratoire avec tirage et cyanose. SpO2 85% AA. Gaz artériels: pH 7.32, pCO2 55, pO2 52. Traitement: oxygénothérapie, bronchodilatateurs nébulisés q4h, prednisone 50mg IV, antibiotiques (lévofloxacine). Amélioration progressive sur 5 jours. Sevrage O2 réussi. Spirométrie contrôle: VEMS 45%. Référence en réadaptation pulmonaire. Congé avec plan d'action MPOC.", medecin_traitant: "Dr David Chen" },
    { patientIdx: 8, date_admission: new Date("2025-12-02"), date_sortie: new Date("2025-12-08"), etablissement: "Hôpital Notre-Dame (CHUM)", service: "Pneumologie", motif: "Exacerbation infectieuse de MPOC", resume: "2e hospitalisation en 2 ans pour exacerbation de MPOC. Expectorations purulentes, fièvre 38.6°C. Radiographie: infiltrat base droite. Traitement: amoxicilline-clavulanate IV + prednisone taper. VNI nocturne x 3 nuits. Bonne évolution. Discussion sur oxygénothérapie à domicile si prochaine exacerbation.", medecin_traitant: "Dr David Chen" },
    // Nadeau, Robert (69 ans) - Post-IDM
    { patientIdx: 18, date_admission: new Date("2024-11-15"), date_sortie: new Date("2024-11-22"), etablissement: "Institut de Cardiologie de Montréal", service: "Soins intensifs coronariens / Cardiologie", motif: "Infarctus du myocarde antérieur (STEMI)", resume: "Patient admis via urgence pour douleur thoracique typique avec sus-décalage ST en V1-V4. Troponines > 10 000. Coronarographie urgente: occlusion IVA proximale - angioplastie primaire avec pose de stent actif. Pic CK-MB 280. FEVG initiale 40%. Séjour USI 3 jours. Complications: tachycardie ventriculaire non soutenue transitoire. Réadaptation cardiaque débutée J5. Congé sous double antiagrégation (ASA + clopidogrel), statine haute dose, IECA, bêta-bloquant. Suivi rapproché prévu.", medecin_traitant: "Dre Sophie Lavoie" },
    // Tremblay, Georges (83 ans) - Chute + confusion
    { patientIdx: 10, date_admission: new Date("2024-08-20"), date_sortie: new Date("2024-09-01"), etablissement: "Hôpital régional de Rimouski", service: "Médecine interne", motif: "Chute avec fracture poignet + délirium", resume: "Patient Alzheimer admis suite à une chute à domicile. Fracture radius distal gauche traitée par plâtre (non chirurgical). Développement d'un délirium hyperactif J2. Bilan infectieux: infection urinaire à E. coli. Traitement: antibiotiques, réorientation, mobilisation progressive. Évaluation gériatrique complète: ajustement médication, recommandations sécurité domicile. Référence CLSC pour services à domicile. Durée de séjour prolongée par récupération lente.", medecin_traitant: "Dre Sophie Lavoie" },
    // Lévesque, Alain (62 ans) - Chirurgie discale
    { patientIdx: 12, date_admission: new Date("2025-01-20"), date_sortie: new Date("2025-01-23"), etablissement: "Hôpital de Gatineau", service: "Chirurgie orthopédique", motif: "Discectomie L4-L5", resume: "Chirurgie élective pour hernie discale L4-L5 avec radiculopathie réfractaire au traitement conservateur. Discectomie microchirurgicale réalisée sans complication. Douleur radiculaire résolue en post-opératoire immédiat. Mobilisation J1. Congé J3 avec consignes de restriction de soulèvement x 6 semaines. Suivi en physiatrie prévu.", medecin_traitant: "Dr David Chen" },
    // Bergeron, Francine (70 ans) - AVC
    { patientIdx: 13, date_admission: new Date("2024-04-10"), date_sortie: new Date("2024-04-20"), etablissement: "Hôpital de l'Enfant-Jésus (CHU de Québec)", service: "Neurologie / Unité AVC", motif: "AVC ischémique mineur", resume: "Patiente admise pour aphasie d'apparition soudaine et faiblesse du bras droit. CT-scan: AVC ischémique territoire sylvien gauche. Hors délai thrombolyse. FA connue, INR sous-thérapeutique à 1.3. Récupération rapide du langage en 48h, faiblesse résiduelle légère main droite. Réadaptation intensive débutée. Ajustement warfarine. Échographie carotidienne: sténose 40% gauche. Congé en centre de réadaptation x 5 jours puis domicile.", medecin_traitant: "Dr David Chen" },
    // Paquette, Denis (77 ans) - Hypoglycémie sévère
    { patientIdx: 16, date_admission: new Date("2025-08-05"), date_sortie: new Date("2025-08-07"), etablissement: "CHUS - Hôpital Fleurimont", service: "Médecine interne", motif: "Hypoglycémie sévère avec perte de conscience", resume: "Patient diabétique sous insuline admis après épisode d'hypoglycémie sévère (glycémie 1.8 mmol/L) avec perte de conscience à domicile. Glucagon administré par ambulanciers. Cause identifiée: saut de repas + dose habituelle d'insuline. Observation 48h, éducation diabétique renforcée, ajustement doses insuline. Congé avec glucomètre à lecture continue recommandé.", medecin_traitant: "Dr Jean Tremblay" },
    // Simard, Patrick (43 ans) - Hémorragie digestive
    { patientIdx: 14, date_admission: new Date("2025-06-28"), date_sortie: new Date("2025-07-02"), etablissement: "Hôpital Royal Victoria (CUSM)", service: "Gastroentérologie", motif: "Hémorragie digestive haute sur ulcère gastrique", resume: "Patient admis pour hématémèse et méléna. Hémoglobine à l'arrivée 78 g/L. Réanimation volémique + transfusion 2 culots. Gastroscopie urgente: ulcère gastrique Forrest IIa avec vaisseau visible - hémostase par clips. Biopsies H. pylori positives. Stabilisation rapide. Traitement d'éradication H. pylori débuté. Congé sous IPP haute dose x 8 semaines.", medecin_traitant: "Dr Jean Tremblay" },
  ];

  for (const h of hospitalisationsData) {
    await prisma.hospitalisation.create({
      data: {
        date_admission: h.date_admission,
        date_sortie: h.date_sortie,
        etablissement: h.etablissement,
        service: h.service,
        motif: h.motif,
        resume: h.resume,
        medecin_traitant: h.medecin_traitant,
        dossier_id: patients[h.patientIdx].dossier.id_dossier,
      }
    });
  }

  console.log("✅ 10 hospitalisations créées");

  console.log("🌱 Seed terminé avec succès !");
  console.log("");
  console.log("📋 Comptes de connexion (mot de passe: Password123!):");
  console.log("   - jean.tremblay@sante-quebec.local (Médecin général - 20 patients)");
  console.log("   - sophie.lavoie@sante-quebec.local (Médecin spécialiste - 10 patients)");
  console.log("   - david.chen@sante-quebec.local (Médecin général - 12 patients)");
  console.log("   - marie.roy@sante-quebec.local (Infirmière - 20 patients)");
  console.log("   - luc.bouchard@sante-quebec.local (Infirmier - 10 patients)");
  console.log("   - anne.girard@sante-quebec.local (Pharmacienne - lecture seule)");
  console.log("   - marc.pelletier@sante-quebec.local (Ambulancier)");
  console.log("   - admin@sante-quebec.local (Admin)");
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
