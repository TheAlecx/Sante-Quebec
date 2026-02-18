"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const consultation_controller_1 = require("../controllers/consultation.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const permission_middleware_1 = require("../middlewares/permission.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// Lire les consultations d’un dossier
router.get("/dossier/:dossierId", (0, permission_middleware_1.checkPermission)("lecture"), consultation_controller_1.getConsultationsByDossier);
// Créer une consultation
router.post("/dossier/:dossierId", (0, permission_middleware_1.checkPermission)("ajout"), consultation_controller_1.createConsultation);
// Modifier une consultation
router.put("/:id", (0, permission_middleware_1.checkPermission)("modification"), consultation_controller_1.updateConsultation);
// Supprimer une consultation
router.delete("/:id", (0, permission_middleware_1.checkPermission)("suppression"), consultation_controller_1.deleteConsultation);
exports.default = router;
