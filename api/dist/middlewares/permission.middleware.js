"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPermission = checkPermission;
const urgence_middleware_1 = require("./urgence.middleware");
const prisma_1 = require("../utils/prisma");
function checkPermission(action) {
    return async (req, res, next) => {
        const userId = req.user.id;
        const dossierId = req.params.dossierId || req.body.dossierId || req.query.dossierId;
        if (!dossierId) {
            return res.status(400).json({ message: "Dossier manquant" });
        }
        const urgenceActive = await (0, urgence_middleware_1.checkUrgence)(userId, dossierId);
        if (urgenceActive) {
            req.isUrgence = true;
            return next();
        }
        const permission = await prisma_1.prisma.autorisationDossier.findFirst({
            where: {
                utilisateur_id: userId,
                dossier_id: dossierId,
                [action]: true
            }
        });
        if (!permission) {
            return res.status(403).json({ message: "Accès refusé" });
        }
        next();
    };
}
