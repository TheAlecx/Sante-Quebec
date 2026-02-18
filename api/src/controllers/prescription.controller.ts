import { Request, Response } from "express";
import * as prescriptionService from "../services/prescription.service";
import { logAudit } from "../utils/audit";

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
  const { instructions } = req.body;

  const prescription = await prescriptionService.update(Array.isArray(id) ? id[0] : id, { instructions });

  await logAudit(req, "MODIFICATION", "Prescription", Array.isArray(id) ? id[0] : id);

  res.json(prescription);
}

export async function deletePrescription(req: Request, res: Response) {
  const { id } = req.params;

  await prescriptionService.remove(Array.isArray(id) ? id[0] : id);

  await logAudit(req, "SUPPRESSION", "Prescription", Array.isArray(id) ? id[0] : id);

  res.sendStatus(204);
}
