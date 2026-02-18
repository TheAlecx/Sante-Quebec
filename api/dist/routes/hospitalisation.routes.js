"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const permission_middleware_1 = require("../middlewares/permission.middleware");
const prisma_1 = require("../utils/prisma");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// Lire les hospitalisations d'un dossier
router.get("/dossier/:dossierId", (0, permission_middleware_1.checkPermission)("lecture"), async (req, res) => {
    const dossierId = req.params.dossierId;
    const hospitalisations = await prisma_1.prisma.hospitalisation.findMany({
        where: { dossier_id: dossierId },
        orderBy: { date_admission: "desc" },
    });
    res.json(hospitalisations);
});
// Créer une hospitalisation
router.post("/dossier/:dossierId", (0, permission_middleware_1.checkPermission)("ajout"), async (req, res) => {
    const dossierId = req.params.dossierId;
    const { date_admission, date_sortie, etablissement, service, motif, resume, medecin_traitant } = req.body;
    const hospitalisation = await prisma_1.prisma.hospitalisation.create({
        data: {
            date_admission: new Date(date_admission),
            date_sortie: date_sortie ? new Date(date_sortie) : null,
            etablissement,
            service,
            motif,
            resume,
            medecin_traitant: medecin_traitant || null,
            dossier_id: dossierId,
        },
    });
    res.status(201).json(hospitalisation);
});
// Modifier une hospitalisation
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { date_admission, date_sortie, etablissement, service, motif, resume, medecin_traitant } = req.body;
    // Vérifier que l'hospitalisation existe et récupérer le dossierId pour la permission
    const existing = await prisma_1.prisma.hospitalisation.findUnique({ where: { id_hospitalisation: id } });
    if (!existing) {
        return res.status(404).json({ message: "Hospitalisation non trouvée" });
    }
    const updated = await prisma_1.prisma.hospitalisation.update({
        where: { id_hospitalisation: id },
        data: {
            ...(date_admission && { date_admission: new Date(date_admission) }),
            ...(date_sortie !== undefined && { date_sortie: date_sortie ? new Date(date_sortie) : null }),
            ...(etablissement && { etablissement }),
            ...(service && { service }),
            ...(motif && { motif }),
            ...(resume && { resume }),
            ...(medecin_traitant !== undefined && { medecin_traitant: medecin_traitant || null }),
        },
    });
    res.json(updated);
});
// Supprimer une hospitalisation
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    await prisma_1.prisma.hospitalisation.delete({ where: { id_hospitalisation: id } });
    res.json({ message: "Hospitalisation supprimée" });
});
exports.default = router;
