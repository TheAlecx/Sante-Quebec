"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getByDossier = getByDossier;
exports.create = create;
exports.update = update;
exports.remove = remove;
const prisma_1 = require("../utils/prisma");
function getByDossier(dossierId) {
    return prisma_1.prisma.prescription.findMany({
        where: { dossier_id: dossierId },
        include: {
            medicaments: {
                include: {
                    medicament: true
                }
            }
        },
        orderBy: { date: "desc" }
    });
}
async function create({ dossierId, instructions, medicaments, medecinId }) {
    return prisma_1.prisma.prescription.create({
        data: {
            date: new Date(),
            instructions,
            dossier_id: dossierId,
            medecin_id: medecinId,
            medicaments: {
                create: medicaments.map(m => ({
                    medicament: {
                        create: {
                            nom: m.nom,
                            dosage: m.dosage
                        }
                    }
                }))
            }
        },
        include: {
            medicaments: {
                include: { medicament: true }
            }
        }
    });
}
function update(id, data) {
    return prisma_1.prisma.prescription.update({
        where: { id_prescription: id },
        data
    });
}
function remove(id) {
    return prisma_1.prisma.prescription.delete({
        where: { id_prescription: id }
    });
}
