import { Request, Response } from "express";
import { logAudit } from "../utils/audit";
import { prisma } from "../utils/prisma";

export async function activerUrgence(req: Request, res: Response) {
  const dossierId = Array.isArray(req.params.dossierId) ? req.params.dossierId[0] : req.params.dossierId;
  const { raison, dureeMinutes } = req.body;

  if (!raison) {
    return res.status(400).json({ message: "Raison obligatoire" });
  }

  const dateFin = new Date(Date.now() + (dureeMinutes || 60) * 60000);

  const acces = await prisma.accesUrgence.create({
    data: {
      raison,
      dossier_id: dossierId,
      utilisateur_id: req.user!.id,
      date_fin: dateFin
    }
  });

  await logAudit(req, "CREATION", "AccesUrgence", acces.id_acces);

  res.status(201).json({
    message: "Accès urgence activé",
    expiration: dateFin
  });
}
