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
exports.getPrescriptionsByDossier = getPrescriptionsByDossier;
exports.createPrescription = createPrescription;
exports.updatePrescription = updatePrescription;
exports.deletePrescription = deletePrescription;
const prescriptionService = __importStar(require("../services/prescription.service"));
const audit_1 = require("../utils/audit");
async function getPrescriptionsByDossier(req, res) {
    const { dossierId } = req.params;
    const prescriptions = await prescriptionService.getByDossier(Array.isArray(dossierId) ? dossierId[0] : dossierId);
    res.json(prescriptions);
}
async function createPrescription(req, res) {
    const { dossierId } = req.params;
    const { instructions, medicaments } = req.body;
    const prescription = await prescriptionService.create({
        dossierId: Array.isArray(dossierId) ? dossierId[0] : dossierId,
        instructions,
        medicaments,
        medecinId: req.user.id
    });
    await (0, audit_1.logAudit)(req, "CREATION", "Prescription", prescription.id_prescription);
    res.status(201).json(prescription);
}
async function updatePrescription(req, res) {
    const { id } = req.params;
    const { instructions } = req.body;
    const prescription = await prescriptionService.update(Array.isArray(id) ? id[0] : id, { instructions });
    await (0, audit_1.logAudit)(req, "MODIFICATION", "Prescription", Array.isArray(id) ? id[0] : id);
    res.json(prescription);
}
async function deletePrescription(req, res) {
    const { id } = req.params;
    await prescriptionService.remove(Array.isArray(id) ? id[0] : id);
    await (0, audit_1.logAudit)(req, "SUPPRESSION", "Prescription", Array.isArray(id) ? id[0] : id);
    res.sendStatus(204);
}
