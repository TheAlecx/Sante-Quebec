import { Request, Response } from "express";
import * as consultationService from "../services/consultation.service";
import { logAudit } from "../utils/audit";

export async function getConsultationsByDossier(req: Request, res: Response) {
  const dossierId = req.params.dossierId as string;

  const consultations = await consultationService.getByDossier(dossierId);
  res.json(consultations);
}

export async function createConsultation(req: Request, res: Response) {
  const dossierId = req.params.dossierId as string;
  const { motif, diagnostic } = req.body;

  const consultation = await consultationService.create({
    dossierId,
    motif,
    diagnostic,
    userId: req.user.id
  });

  await logAudit(req, "CREATION", "Consultation", consultation.id_consultation);
  res.status(201).json(consultation);
}

export async function updateConsultation(req: Request, res: Response) {
  const id = req.params.id as string;
  const { motif, diagnostic } = req.body;

  const consultation = await consultationService.update(id, {
    motif,
    diagnostic
  });

  await logAudit(req, "MODIFICATION", "Consultation", id);
  res.json(consultation);
}

export async function deleteConsultation(req: Request, res: Response) {
  const id = req.params.id as string;

  await consultationService.remove(id);
  await logAudit(req, "SUPPRESSION", "Consultation", id);

  res.sendStatus(204);
}
