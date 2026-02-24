import { Request, Response } from "express";
import * as prescriptionService from "../services/prescription.service";
import { logAudit } from "../utils/audit";
import { prisma } from "../utils/prisma";

export async function getPrescriptionsByDossier(req: Request, res: Response) {
  const { dossierId } = req.params;

  const prescriptions = await prescriptionService.getByDossier(Array.isArray(dossierId) ? dossierId[0] : dossierId);
  res.json(prescriptions);
}

export async function createPrescription(req: Request, res: Response) {
  const { dossierId } = req.params;
  const { instructions, medicaments } = req.body;

  const prescription = await prescriptionService.create({
    dossierId: Array.isArray(dossierId) ? dossierId[0] : dossierId,
    instructions,
    medicaments,
    medecinId: req.user!.id
  });

  await logAudit(req, "CREATION", "Prescription", prescription.id_prescription);

  res.status(201).json(prescription);
}

export async function updatePrescription(req: Request, res: Response) {
  const { id } = req.params;
  const prescriptionId = Array.isArray(id) ? id[0] : id;
  const { instructions, medicaments } = req.body;

  const prescription = await prisma.prescription.findUnique({
    where: { id_prescription: prescriptionId },
    select: { dossier_id: true },
  });

  if (!prescription) {
    return res.status(404).json({ message: "Prescription non trouvée" });
  }

  if (req.user!.role !== "ADMIN") {
    const perm = await prisma.autorisationDossier.findFirst({
      where: {
        utilisateur_id: req.user!.id,
        dossier_id: prescription.dossier_id,
        modification: true,
      },
    });
    if (!perm) {
      return res.status(403).json({ message: "Accès refusé" });
    }
  }

  const updated = await prescriptionService.update(prescriptionId, { instructions, medicaments });

  await logAudit(req, "MODIFICATION", "Prescription", prescriptionId);

  res.json(updated);
}

export async function deletePrescription(req: Request, res: Response) {
  const { id } = req.params;
  const prescriptionId = Array.isArray(id) ? id[0] : id;

  const prescription = await prisma.prescription.findUnique({
    where: { id_prescription: prescriptionId },
    select: { dossier_id: true },
  });

  if (!prescription) {
    return res.status(404).json({ message: "Prescription non trouvée" });
  }

  // ADMIN peut toujours supprimer ; les autres doivent avoir la permission modification
  if (req.user!.role !== "ADMIN") {
    const perm = await prisma.autorisationDossier.findFirst({
      where: {
        utilisateur_id: req.user!.id,
        dossier_id: prescription.dossier_id,
        modification: true,
      },
    });
    if (!perm) {
      return res.status(403).json({ message: "Accès refusé" });
    }
  }

  // Supprimer les médicaments liés en premier (pas de cascade dans le schéma)
  await prisma.$transaction(async (tx) => {
    await tx.prescriptionMedicament.deleteMany({ where: { prescription_id: prescriptionId } });
    await tx.prescription.delete({ where: { id_prescription: prescriptionId } });
  });

  await logAudit(req, "SUPPRESSION", "Prescription", prescriptionId);

  res.sendStatus(204);
}
