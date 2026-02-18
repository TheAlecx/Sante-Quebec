"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUrgence = checkUrgence;
const prisma_1 = require("../utils/prisma");
async function checkUrgence(userId, dossierId) {
    const urgence = await prisma_1.prisma.accesUrgence.findFirst({
        where: {
            utilisateur_id: userId,
            dossier_id: dossierId,
            actif: true,
            date_fin: { gt: new Date() }
        }
    });
    return !!urgence;
}
