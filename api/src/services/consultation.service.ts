import { PrismaClient } from "@prisma/client/extension";

const prisma = new PrismaClient();

export function getByDossier(dossierId: string) {
  return prisma.consultation.findMany({
    where: { dossier_id: dossierId },
    orderBy: { date: "desc" }
  });
}

export function create({
  dossierId,
  motif,
  diagnostic,
  userId
}: {
  dossierId: string;
  motif: string;
  diagnostic?: string;
  userId: string;
}) {
  return prisma.consultation.create({
    data: {
      date: new Date(),
      motif,
      diagnostic,
      dossier_id: dossierId,
      cree_par: userId
    }
  });
}

export function update(
  id: string,
  data: { motif?: string; diagnostic?: string }
) {
  return prisma.consultation.update({
    where: { id_consultation: id },
    data
  });
}

export function remove(id: string) {
  return prisma.consultation.delete({
    where: { id_consultation: id }
  });
}
