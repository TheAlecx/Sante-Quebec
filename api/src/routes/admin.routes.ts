import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { prisma } from "../utils/prisma";
import bcrypt from "bcrypt";

const router = Router();

// Toutes ces routes sont réservées aux administrateurs
router.use(authenticate, (req, res, next) => {
  if (req.user!.role !== "ADMIN") {
    return res.status(403).json({ message: "Accès réservé aux administrateurs" });
  }
  next();
});

const USER_SELECT = {
  id_utilisateur: true,
  nom: true,
  prenom: true,
  email: true,
  role: true,
  actif: true,
  institution: true,
  numero_praticien: true,
  createdAt: true,
} as const;

// ── Liste des utilisateurs ────────────────────────────────────────────────────
router.get("/users", async (req, res) => {
  const { search, role, actif } = req.query;

  const users = await prisma.utilisateur.findMany({
    where: {
      ...(search && {
        OR: [
          { nom: { contains: search as string, mode: "insensitive" } },
          { prenom: { contains: search as string, mode: "insensitive" } },
          { email: { contains: search as string, mode: "insensitive" } },
        ],
      }),
      ...(role && role !== "" && { role: role as never }),
      ...(actif !== undefined && actif !== "" && { actif: actif === "true" }),
    },
    select: USER_SELECT,
    orderBy: [{ actif: "desc" }, { nom: "asc" }, { prenom: "asc" }],
  });

  res.json(users);
});

// ── Créer un utilisateur ──────────────────────────────────────────────────────
router.post("/users", async (req, res) => {
  const { nom, prenom, email, password, role, institution, numero_praticien, actif } = req.body;

  if (!nom || !prenom || !email || !password || !role) {
    return res.status(400).json({ message: "Champs obligatoires manquants (nom, prénom, courriel, mot de passe, rôle)" });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: "Le mot de passe doit contenir au moins 8 caractères" });
  }

  const existing = await prisma.utilisateur.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: "Cette adresse courriel est déjà utilisée" });
  }

  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.utilisateur.create({
    data: {
      email,
      mot_de_passe: hash,
      nom,
      prenom,
      role,
      institution: institution?.trim() || null,
      numero_praticien: numero_praticien?.trim() || null,
      actif: actif !== undefined ? actif : true,
    },
    select: USER_SELECT,
  });

  res.status(201).json(user);
});

// ── Modifier un utilisateur ───────────────────────────────────────────────────
router.put("/users/:id", async (req, res) => {
  const id = req.params.id as string;
  const { nom, prenom, email, role, institution, numero_praticien, actif, password } = req.body;

  const existing = await prisma.utilisateur.findUnique({ where: { id_utilisateur: id } });
  if (!existing) {
    return res.status(404).json({ message: "Utilisateur non trouvé" });
  }

  if (email && email !== existing.email) {
    const emailTaken = await prisma.utilisateur.findUnique({ where: { email } });
    if (emailTaken) {
      return res.status(409).json({ message: "Cette adresse courriel est déjà utilisée" });
    }
  }

  if (password && password.length < 8) {
    return res.status(400).json({ message: "Le mot de passe doit contenir au moins 8 caractères" });
  }

  const updateData: Record<string, unknown> = {};
  if (nom !== undefined) updateData.nom = nom;
  if (prenom !== undefined) updateData.prenom = prenom;
  if (email !== undefined) updateData.email = email;
  if (role !== undefined) updateData.role = role;
  if (institution !== undefined) updateData.institution = institution?.trim() || null;
  if (numero_praticien !== undefined) updateData.numero_praticien = numero_praticien?.trim() || null;
  if (actif !== undefined) updateData.actif = actif;
  if (password) updateData.mot_de_passe = await bcrypt.hash(password, 10);

  const updated = await prisma.utilisateur.update({
    where: { id_utilisateur: id },
    data: updateData,
    select: USER_SELECT,
  });

  res.json(updated);
});

// ── Supprimer un utilisateur ──────────────────────────────────────────────────
router.delete("/users/:id", async (req, res) => {
  const id = req.params.id as string;

  if (id === req.user!.id) {
    return res.status(400).json({ message: "Vous ne pouvez pas supprimer votre propre compte" });
  }

  const existing = await prisma.utilisateur.findUnique({ where: { id_utilisateur: id } });
  if (!existing) {
    return res.status(404).json({ message: "Utilisateur non trouvé" });
  }

  // Vérifier si des données médicales sont liées
  const [autorisations, consultations, prescriptions, observations] = await Promise.all([
    prisma.autorisationDossier.count({ where: { utilisateur_id: id } }),
    prisma.consultation.count({ where: { cree_par: id } }),
    prisma.prescription.count({ where: { medecin_id: id } }),
    prisma.observationMedicale.count({ where: { cree_par: id } }),
  ]);

  const hasRelatedData = autorisations + consultations + prescriptions + observations > 0;

  if (hasRelatedData) {
    return res.status(409).json({
      message: "Ce compte possède des données médicales liées et ne peut pas être supprimé. Désactivez-le à la place.",
      hasRelatedData: true,
    });
  }

  await prisma.utilisateur.delete({ where: { id_utilisateur: id } });
  res.json({ message: "Compte supprimé avec succès" });
});

// ── Supprimer un patient et son dossier complet ───────────────────────────────
router.delete("/dossiers/:dossierId", async (req, res) => {
  const dossierId = req.params.dossierId as string;

  const dossier = await prisma.dossierMedical.findUnique({
    where: { id_dossier: dossierId },
  });

  if (!dossier) {
    return res.status(404).json({ message: "Dossier non trouvé" });
  }

  await prisma.$transaction(async (tx) => {
    // Supprimer dans le bon ordre pour respecter les contraintes FK
    await tx.accesUrgence.deleteMany({ where: { dossier_id: dossierId } });
    await tx.autorisationDossier.deleteMany({ where: { dossier_id: dossierId } });
    await tx.fhirMapping.deleteMany({ where: { dossier_id: dossierId } });
    await tx.hospitalisation.deleteMany({ where: { dossier_id: dossierId } });
    await tx.observationMedicale.deleteMany({ where: { dossier_id: dossierId } });

    const prescriptions = await tx.prescription.findMany({ where: { dossier_id: dossierId } });
    for (const p of prescriptions) {
      await tx.prescriptionMedicament.deleteMany({ where: { prescription_id: p.id_prescription } });
    }
    await tx.prescription.deleteMany({ where: { dossier_id: dossierId } });
    await tx.consultation.deleteMany({ where: { dossier_id: dossierId } });
    await tx.dossierMedical.delete({ where: { id_dossier: dossierId } });

    await tx.couvertureAssurance.deleteMany({ where: { patient_id: dossier.patient_id } });
    await tx.echangeAssurance.deleteMany({ where: { patient_id: dossier.patient_id } });
    await tx.patient.delete({ where: { id_patient: dossier.patient_id } });
  });

  res.json({ message: "Patient et dossier supprimés définitivement" });
});

export default router;
