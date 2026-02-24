import { Router } from "express";
import {
  createPrescription,
  getPrescriptionsByDossier,
  updatePrescription,
  deletePrescription
} from "../controllers/prescription.controller";

import { authenticate } from "../middlewares/auth.middleware";
import { checkPermission } from "../middlewares/permission.middleware";

const router = Router();

router.use(authenticate);

// Lire prescriptions
router.get(
  "/dossier/:dossierId",
  checkPermission("lecture"),
  getPrescriptionsByDossier
);

// Créer prescription (médecin uniquement)
router.post(
  "/dossier/:dossierId",
  checkPermission("ajout"),
  createPrescription
);

// Modifier
router.put(
  "/:id",
  checkPermission("modification"),
  updatePrescription
);

// Supprimer (la vérification de permission est faite dans le contrôleur)
router.delete("/:id", deletePrescription);

export default router;
