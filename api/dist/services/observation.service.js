"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getByDossier = getByDossier;
exports.create = create;
exports.update = update;
exports.remove = remove;
const prisma_1 = require("../utils/prisma");
function getByDossier(dossierId) {
    return prisma_1.prisma.observationMedicale.findMany({
        where: { dossier_id: dossierId },
        orderBy: { date: "desc" }
    });
}
function create({ dossierId, type, valeur, userId }) {
    return prisma_1.prisma.observationMedicale.create({
        data: {
            type,
            valeur,
            date: new Date(),
            dossier_id: dossierId,
            cree_par: userId
        }
    });
}
function update(id, data) {
    return prisma_1.prisma.observationMedicale.update({
        where: { id_observation: id },
        data
    });
}
function remove(id) {
    return prisma_1.prisma.observationMedicale.delete({
        where: { id_observation: id }
    });
}
