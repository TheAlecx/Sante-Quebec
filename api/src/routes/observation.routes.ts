import { Router } from "express";
import {
  createObservation,
  getObservationsByDossier,
  updateObservation,
  deleteObservation
} from "../controllers/observation.controller";

import { authenticate } from "../middlewares/auth.middleware";
import { checkPermission } from "../middlewares/permission.middleware";

const router = Router();

router.use(authenticate);

// Lire observations d’un dossier
router.get(
  "/dossier/:dossierId",
  checkPermission("lecture"),
  getObservationsByDossier
);

// Créer observation
router.post(
  "/dossier/:dossierId",
  checkPermission("ajout"),
  createObservation
);

// Modifier observation
router.put(
  "/:id",
  checkPermission("modification"),
  updateObservation
);

// Supprimer observation
router.delete(
  "/:id",
  checkPermission("suppression"),
  deleteObservation
);

export default router;
