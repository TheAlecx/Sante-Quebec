import { prisma } from "../utils/prisma";

export function getByDossier(dossierId: string) {
  return prisma.observationMedicale.findMany({
    where: { dossier_id: dossierId },
    orderBy: { date: "desc" }
  });
}

export function create({
  dossierId,
  type,
  valeur,
  userId
}: {
  dossierId: string;
  type: string;
  valeur: string;
  userId: string;
}) {
  return prisma.observationMedicale.create({
    data: {
      type,
      valeur,
      date: new Date(),
      dossier_id: dossierId,
      cree_par: userId
    }
  });
}

export function update(
  id: string,
  data: { type?: string; valeur?: string }
) {
  return prisma.observationMedicale.update({
    where: { id_observation: id },
    data
  });
}

export function remove(id: string) {
  return prisma.observationMedicale.delete({
    where: { id_observation: id }
  });
}
