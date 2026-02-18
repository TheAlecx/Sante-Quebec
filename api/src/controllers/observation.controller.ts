import { Request, Response } from "express";
import * as observationService from "../services/observation.service";
import { logAudit } from "../utils/audit";

export async function getObservationsByDossier(req: Request, res: Response) {
  const dossierId = Array.isArray(req.params.dossierId) ? req.params.dossierId[0] : req.params.dossierId;

  const observations = await observationService.getByDossier(dossierId);
  res.json(observations);
}

export async function createObservation(req: Request, res: Response) {
  const dossierId = Array.isArray(req.params.dossierId) ? req.params.dossierId[0] : req.params.dossierId;
  const { type, valeur } = req.body;

  const observation = await observationService.create({
    dossierId,
    type,
    valeur,
    userId: req.user!.id
  });

  await logAudit(req, "CREATION", "ObservationMedicale", observation.id_observation);

  res.status(201).json(observation);
}

export async function updateObservation(req: Request, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { type, valeur } = req.body;

  const observation = await observationService.update(id, { type, valeur });

  await logAudit(req, "MODIFICATION", "ObservationMedicale", id);

  res.json(observation);
}

export async function deleteObservation(req: Request, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  await observationService.remove(id);

  await logAudit(req, "SUPPRESSION", "ObservationMedicale", id);

  res.sendStatus(204);
}
