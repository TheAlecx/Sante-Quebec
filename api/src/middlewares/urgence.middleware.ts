import { prisma } from "../utils/prisma";

export async function checkUrgence(userId: string, dossierId: string) {
  const urgence = await prisma.accesUrgence.findFirst({
    where: {
      utilisateur_id: userId,
      dossier_id: dossierId,
      actif: true,
      date_fin: { gt: new Date() }
    }
  });

  return !!urgence;
}
