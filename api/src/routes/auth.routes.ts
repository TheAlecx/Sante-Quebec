import { Router } from "express";
import { login, me } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { prisma } from "../utils/prisma";
import bcrypt from "bcrypt";

const router = Router();

const PROFESSIONAL_ROLES = [
  "INFIRMIER",
  "AMBULANCIER",
  "PHARMACIEN",
  "MEDECIN_GENERAL",
  "MEDECIN_SPECIALISTE",
];

router.post("/login", login);
router.get("/me", authenticate, me);

router.post("/register", async (req, res) => {
  let {
    nom, prenom, email, password, role, numero_praticien,
    // Champs spécifiques aux patients
    date_naissance, sexe, numero_assurance, telephone, adresse,
  } = req.body;

  email = email?.toLowerCase();
  if (!nom || !prenom || !email || !password || !role) {
    return res.status(400).json({ message: "Tous les champs obligatoires doivent être remplis" });
  }

  const validRoles = [...PROFESSIONAL_ROLES, "PATIENT"];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: "Rôle invalide" });
  }

  if (PROFESSIONAL_ROLES.includes(role) && !numero_praticien?.trim()) {
    return res.status(400).json({ message: "Le numéro de praticien est requis pour les professionnels de santé" });
  }

  if (role === "PATIENT" && (!date_naissance || !sexe)) {
    return res.status(400).json({ message: "La date de naissance et le sexe sont requis pour un patient" });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: "Le mot de passe doit contenir au moins 8 caractères" });
  }

  const existing = await prisma.utilisateur.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: "Cette adresse courriel est déjà utilisée" });
  }

  const hash = await bcrypt.hash(password, 10);
  const isProfessional = PROFESSIONAL_ROLES.includes(role);

  await prisma.$transaction(async (tx) => {
    const utilisateur = await tx.utilisateur.create({
      data: {
        email,
        mot_de_passe: hash,
        nom,
        prenom,
        role,
        numero_praticien: isProfessional ? numero_praticien.trim() : null,
        actif: !isProfessional,
      },
    });

    // Pour les patients : créer le dossier médical automatiquement
    if (role === "PATIENT") {
      const patient = await tx.patient.create({
        data: {
          nom,
          prenom,
          date_naissance: new Date(date_naissance),
          sexe,
          ...(numero_assurance?.trim() && { numero_assurance: numero_assurance.trim() }),
          ...(telephone?.trim() && { telephone: telephone.trim() }),
          ...(adresse?.trim() && { adresse: adresse.trim() }),
        },
      });

      const dossier = await tx.dossierMedical.create({
        data: { patient_id: patient.id_patient, etat: "ACTIF" },
      });

      await tx.autorisationDossier.create({
        data: {
          utilisateur_id: utilisateur.id_utilisateur,
          dossier_id: dossier.id_dossier,
          lecture: true,
          ajout: false,
          modification: false,
          suppression: false,
        },
      });
    }
  });

  res.status(201).json({
    message: isProfessional
      ? "Votre demande a été soumise. Un administrateur validera votre compte sous peu."
      : "Compte créé avec succès. Vous pouvez maintenant vous connecter.",
    pending: isProfessional,
  });
});

export default router;
