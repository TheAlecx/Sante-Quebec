"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activerUrgence = activerUrgence;
const audit_1 = require("../utils/audit");
const prisma_1 = require("../utils/prisma");
async function activerUrgence(req, res) {
    const dossierId = Array.isArray(req.params.dossierId) ? req.params.dossierId[0] : req.params.dossierId;
    const { raison, dureeMinutes } = req.body;
    if (!raison) {
        return res.status(400).json({ message: "Raison obligatoire" });
    }
    const dateFin = new Date(Date.now() + (dureeMinutes || 60) * 60000);
    const acces = await prisma_1.prisma.accesUrgence.create({
        data: {
            raison,
            dossier_id: dossierId,
            utilisateur_id: req.user.id,
            date_fin: dateFin
        }
    });
    await (0, audit_1.logAudit)(req, "CREATION", "AccesUrgence", acces.id_acces);
    res.status(201).json({
        message: "Accès urgence activé",
        expiration: dateFin
    });
}
