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
  const { nom, prenom, email, password, role, numero_praticien } = req.body;

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

  if (password.length < 8) {
    return res.status(400).json({ message: "Le mot de passe doit contenir au moins 8 caractères" });
  }

  const existing = await prisma.utilisateur.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: "Cette adresse courriel est déjà utilisée" });
  }

  const hash = await bcrypt.hash(password, 10);
  const isProfessional = PROFESSIONAL_ROLES.includes(role);

  await prisma.utilisateur.create({
    data: {
      email,
      mot_de_passe: hash,
      nom,
      prenom,
      role,
      numero_praticien: isProfessional ? numero_praticien.trim() : null,
      // Les professionnels sont désactivés en attendant la validation d'un administrateur
      actif: !isProfessional,
    },
  });

  res.status(201).json({
    message: isProfessional
      ? "Votre demande a été soumise. Un administrateur validera votre compte sous peu."
      : "Compte créé avec succès. Vous pouvez maintenant vous connecter.",
    pending: isProfessional,
  });
});

export default router;
