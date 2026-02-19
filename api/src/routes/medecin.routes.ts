import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { prisma } from "../utils/prisma";

const router = Router();

router.use(authenticate);

// Liste de tous les médecins (généralistes et spécialistes)
router.get("/", async (_req, res) => {
  const medecins = await prisma.utilisateur.findMany({
    where: {
      role: { in: ["MEDECIN_GENERAL", "MEDECIN_SPECIALISTE"] },
      actif: true,
    },
    select: {
      id_utilisateur: true,
      nom: true,
      prenom: true,
      role: true,
      institution: true,
    },
    orderBy: [{ nom: "asc" }, { prenom: "asc" }],
  });

  res.json(medecins);
});

// Profil d'un médecin
router.get("/:id", async (req, res) => {
  const id = req.params.id as string;

  const medecin = await prisma.utilisateur.findUnique({
    where: { id_utilisateur: id },
    select: {
      id_utilisateur: true,
      nom: true,
      prenom: true,
      role: true,
      institution: true,
      createdAt: true,
    },
  });

  if (!medecin || !["MEDECIN_GENERAL", "MEDECIN_SPECIALISTE"].includes(medecin.role)) {
    return res.status(404).json({ message: "Médecin non trouvé" });
  }

  const nbDossiers = await prisma.autorisationDossier.count({
    where: { utilisateur_id: id, lecture: true },
  });

  res.json({ ...medecin, nb_dossiers: nbDossiers });
});

// Mettre à jour l'institution (soi-même ou ADMIN)
router.patch("/:id/institution", async (req, res) => {
  const id = req.params.id as string;
  const { institution } = req.body;
  const caller = req.user!;

  if (caller.id !== id && caller.role !== "ADMIN") {
    return res.status(403).json({ message: "Accès refusé" });
  }

  const medecin = await prisma.utilisateur.findUnique({
    where: { id_utilisateur: id },
  });

  if (!medecin || !["MEDECIN_GENERAL", "MEDECIN_SPECIALISTE"].includes(medecin.role)) {
    return res.status(404).json({ message: "Médecin non trouvé" });
  }

  const updated = await prisma.utilisateur.update({
    where: { id_utilisateur: id },
    data: { institution: institution || null },
    select: { id_utilisateur: true, nom: true, prenom: true, role: true, institution: true },
  });

  res.json(updated);
});

export default router;
