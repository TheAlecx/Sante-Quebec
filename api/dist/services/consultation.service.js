"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getByDossier = getByDossier;
exports.create = create;
exports.update = update;
exports.remove = remove;
const prisma_1 = require("../utils/prisma");
function getByDossier(dossierId) {
    return prisma_1.prisma.consultation.findMany({
        where: { dossier_id: dossierId },
        orderBy: { date: "desc" }
    });
}
function create({ dossierId, motif, diagnostic, userId }) {
    return prisma_1.prisma.consultation.create({
        data: {
            date: new Date(),
            motif,
            diagnostic,
            dossier_id: dossierId,
            cree_par: userId
        }
    });
}
function update(id, data) {
    return prisma_1.prisma.consultation.update({
        where: { id_consultation: id },
        data
    });
}
function remove(id) {
    return prisma_1.prisma.consultation.delete({
        where: { id_consultation: id }
    });
}
