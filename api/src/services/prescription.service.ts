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

export async function update(
  id: string,
  data: { instructions?: string; medicaments?: { nom: string; dosage?: string }[] }
) {
  return prisma.$transaction(async (tx) => {
    await tx.prescription.update({
      where: { id_prescription: id },
      data: { instructions: data.instructions },
    });

    if (data.medicaments) {
      // Récupérer les IDs des médicaments liés
      const existing = await tx.prescriptionMedicament.findMany({
        where: { prescription_id: id },
        select: { medicament_id: true },
      });

      // Supprimer les liaisons puis les médicaments orphelins
      await tx.prescriptionMedicament.deleteMany({ where: { prescription_id: id } });
      await tx.medicament.deleteMany({
        where: { id_medicament: { in: existing.map((e) => e.medicament_id) } },
      });

      // Recréer les médicaments
      for (const m of data.medicaments) {
        const medicament = await tx.medicament.create({
          data: { nom: m.nom, dosage: m.dosage || null },
        });
        await tx.prescriptionMedicament.create({
          data: { prescription_id: id, medicament_id: medicament.id_medicament },
        });
      }
    }

    return tx.prescription.findUnique({
      where: { id_prescription: id },
      include: { medicaments: { include: { medicament: true } } },
    });
  });
}

export function remove(id: string) {
  return prisma.prescription.delete({
    where: { id_prescription: id }
  });
}
