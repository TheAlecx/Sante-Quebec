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
exports.getConsultationsByDossier = getConsultationsByDossier;
exports.createConsultation = createConsultation;
exports.updateConsultation = updateConsultation;
exports.deleteConsultation = deleteConsultation;
const consultationService = __importStar(require("../services/consultation.service"));
const audit_1 = require("../utils/audit");
async function getConsultationsByDossier(req, res) {
    const dossierId = req.params.dossierId;
    const consultations = await consultationService.getByDossier(dossierId);
    res.json(consultations);
}
async function createConsultation(req, res) {
    const dossierId = req.params.dossierId;
    const { motif, diagnostic } = req.body;
    const consultation = await consultationService.create({
        dossierId,
        motif,
        diagnostic,
        userId: req.user.id
    });
    await (0, audit_1.logAudit)(req, "CREATION", "Consultation", consultation.id_consultation);
    res.status(201).json(consultation);
}
async function updateConsultation(req, res) {
    const id = req.params.id;
    const { motif, diagnostic } = req.body;
    const consultation = await consultationService.update(id, {
        motif,
        diagnostic
    });
    await (0, audit_1.logAudit)(req, "MODIFICATION", "Consultation", id);
    res.json(consultation);
}
async function deleteConsultation(req, res) {
    const id = req.params.id;
    await consultationService.remove(id);
    await (0, audit_1.logAudit)(req, "SUPPRESSION", "Consultation", id);
    res.sendStatus(204);
}
