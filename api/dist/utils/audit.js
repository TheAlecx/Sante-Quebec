"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAudit = logAudit;
const prisma_1 = require("./prisma");
async function logAudit(req, action, entite, entiteId) {
    await prisma_1.prisma.journalAudit.create({
        data: {
            action,
            entite,
            entite_id: entiteId,
            utilisateur_id: req.user.id,
            ip: req.ip
        }
    });
}
