"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prescription_controller_1 = require("../controllers/prescription.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const permission_middleware_1 = require("../middlewares/permission.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// Lire prescriptions
router.get("/dossier/:dossierId", (0, permission_middleware_1.checkPermission)("lecture"), prescription_controller_1.getPrescriptionsByDossier);
// Créer prescription (médecin uniquement)
router.post("/dossier/:dossierId", (0, permission_middleware_1.checkPermission)("ajout"), prescription_controller_1.createPrescription);
// Modifier
router.put("/:id", (0, permission_middleware_1.checkPermission)("modification"), prescription_controller_1.updatePrescription);
// Supprimer
router.delete("/:id", (0, permission_middleware_1.checkPermission)("suppression"), prescription_controller_1.deletePrescription);
exports.default = router;
