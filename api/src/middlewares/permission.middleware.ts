import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client/extension";

const prisma = new PrismaClient();

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
