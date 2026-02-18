import { ActionAudit } from "@prisma/client";
import { Request } from "express";
import { prisma } from "./prisma";

export async function logAudit(
  req: Request,
  action: ActionAudit,
  entite: string,
  entiteId: string
) {
  await prisma.journalAudit.create({
    data: {
      action,
      entite,
      entite_id: entiteId,
      utilisateur_id: req.user.id,
      ip: req.ip
    }
  });
}
