import { prisma } from "../utils/prisma";

export function getByDossier(dossierId: string) {
  return prisma.prescription.findMany({
    where: { dossier_id: dossierId },
    include: {
      medicaments: {
        include: {
          medicament: true
        }
      }
    },
    orderBy: { date: "desc" }
  });
}

export async function create({
  dossierId,
  instructions,
  medicaments,
  medecinId
}: {
  dossierId: string;
  instructions?: string;
  medicaments: { nom: string; dosage?: string }[];
  medecinId: string;
}) {
  return prisma.prescription.create({
    data: {
      date: new Date(),
      instructions,
      dossier_id: dossierId,
      medecin_id: medecinId,
      medicaments: {
        create: medicaments.map(m => ({
          medicament: {
            create: {
              nom: m.nom,
              dosage: m.dosage
            }
          }
        }))
      }
    },
    include: {
      medicaments: {
        include: { medicament: true }
      }
    }
  });
}

export function update(
  id: string,
  data: { instructions?: string }
) {
  return prisma.prescription.update({
    where: { id_prescription: id },
    data
  });
}

export function remove(id: string) {
  return prisma.prescription.delete({
    where: { id_prescription: id }
  });
}
