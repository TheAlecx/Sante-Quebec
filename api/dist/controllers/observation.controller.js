"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getObservationsByDossier = getObservationsByDossier;
exports.createObservation = createObservation;
exports.updateObservation = updateObservation;
exports.deleteObservation = deleteObservation;
const observationService = __importStar(require("../services/observation.service"));
const audit_1 = require("../utils/audit");
async function getObservationsByDossier(req, res) {
    const dossierId = Array.isArray(req.params.dossierId) ? req.params.dossierId[0] : req.params.dossierId;
    const observations = await observationService.getByDossier(dossierId);
    res.json(observations);
}
async function createObservation(req, res) {
    const dossierId = Array.isArray(req.params.dossierId) ? req.params.dossierId[0] : req.params.dossierId;
    const { type, valeur } = req.body;
    const observation = await observationService.create({
        dossierId,
        type,
        valeur,
        userId: req.user.id
    });
    await (0, audit_1.logAudit)(req, "CREATION", "ObservationMedicale", observation.id_observation);
    res.status(201).json(observation);
}
async function updateObservation(req, res) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { type, valeur } = req.body;
    const observation = await observationService.update(id, { type, valeur });
    await (0, audit_1.logAudit)(req, "MODIFICATION", "ObservationMedicale", id);
    res.json(observation);
}
async function deleteObservation(req, res) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await observationService.remove(id);
    await (0, audit_1.logAudit)(req, "SUPPRESSION", "ObservationMedicale", id);
    res.sendStatus(204);
}
