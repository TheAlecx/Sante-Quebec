"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const observation_controller_1 = require("../controllers/observation.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const permission_middleware_1 = require("../middlewares/permission.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// Lire observations d’un dossier
router.get("/dossier/:dossierId", (0, permission_middleware_1.checkPermission)("lecture"), observation_controller_1.getObservationsByDossier);
// Créer observation
router.post("/dossier/:dossierId", (0, permission_middleware_1.checkPermission)("ajout"), observation_controller_1.createObservation);
// Modifier observation
router.put("/:id", (0, permission_middleware_1.checkPermission)("modification"), observation_controller_1.updateObservation);
// Supprimer observation
router.delete("/:id", (0, permission_middleware_1.checkPermission)("suppression"), observation_controller_1.deleteObservation);
exports.default = router;
