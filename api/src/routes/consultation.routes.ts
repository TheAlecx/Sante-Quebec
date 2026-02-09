import { Router } from "express";
import {
  createConsultation,
  getConsultationsByDossier,
  updateConsultation,
  deleteConsultation
} from "../controllers/consultation.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { checkPermission } from "../middlewares/permission.middleware";

const router = Router();

router.use(authenticate);

// Lire les consultations d’un dossier
router.get(
  "/dossier/:dossierId",
  checkPermission("lecture"),
  getConsultationsByDossier
);

// Créer une consultation
router.post(
  "/dossier/:dossierId",
  checkPermission("ajout"),
  createConsultation
);

// Modifier une consultation
router.put(
  "/:id",
  checkPermission("modification"),
  updateConsultation
);

// Supprimer une consultation
router.delete(
  "/:id",
  checkPermission("suppression"),
  deleteConsultation
);

export default router;
