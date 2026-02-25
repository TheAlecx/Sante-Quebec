import { Request, Response, NextFunction } from "express";
import { checkUrgence } from "./urgence.middleware";
import { prisma } from "../utils/prisma";

export function checkPermission(
  action: "lecture" | "ajout" | "modification" | "suppression"
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id;
    const dossierId =
      req.params.dossierId || req.body.dossierId || req.query.dossierId;

    if (!dossierId) {
      return res.status(400).json({ message: "Dossier manquant" });
    }

    const urgenceActive = await checkUrgence(userId, dossierId);
    if (urgenceActive) {
      req.isUrgence = true;
      return next();
    }

    // Le médecin traitant a accès à lecture/ajout/modification (pas suppression)
    const role = req.user.role;
    if (
      action !== "suppression" &&
      (role === "MEDECIN_GENERAL" || role === "MEDECIN_SPECIALISTE")
    ) {
      const estTraitant = await prisma.dossierMedical.findFirst({
        where: { id_dossier: dossierId, medecin_traitant_id: userId },
      });
      if (estTraitant) return next();
    }

    // L'infirmier peut modifier/ajouter s'il a accès en lecture au dossier (pas suppression)
    if (action !== "suppression" && role === "INFIRMIER") {
      const aLecture = await prisma.autorisationDossier.findFirst({
        where: { utilisateur_id: userId, dossier_id: dossierId, lecture: true },
      });
      if (aLecture) return next();
    }

    const permission = await prisma.autorisationDossier.findFirst({
      where: {
        utilisateur_id: userId,
        dossier_id: dossierId,
        [action]: true
      }
    });

    if (!permission) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    next();
  };
}
