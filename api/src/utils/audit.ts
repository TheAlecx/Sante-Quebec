import { ActionAudit } from "../generated/prisma/client";
import { PrismaClient } from "@prisma/client/extension";
import { Request } from "express";

const prisma = new PrismaClient();

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
