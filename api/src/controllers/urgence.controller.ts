import { Request, Response } from "express";
import { logAudit } from "../utils/audit";
import { prisma } from "../utils/prisma";

export async function rechercherPatient(req: Request, res: Response) {
  const numeroAssurance = req.params.numeroAssurance as string;

  const patient = await prisma.patient.findUnique({
    where: { numero_assurance: numeroAssurance },
    include: {
      dossier: {
        include: {
          prescriptions: {
            orderBy: { date: "desc" },
            take: 5,
            include: {
              medicaments: {
                include: { medicament: true }
              }
            }
          }
        }
      }
    }
  });

  if (!patient || !patient.dossier) {
    return res.status(404).json({ message: "Patient non trouvé" });
  }

  res.json({
    dossier_id: patient.dossier.id_dossier,
    patient: {
      nom: patient.nom,
      prenom: patient.prenom,
      date_naissance: patient.date_naissance,
      sexe: patient.sexe,
      numero_assurance: patient.numero_assurance,
      telephone: patient.telephone,
    },
    prescriptions: patient.dossier.prescriptions
  });
}

export async function activerUrgence(req: Request, res: Response) {
  const dossierId = Array.isArray(req.params.dossierId) ? req.params.dossierId[0] : req.params.dossierId;
  const {
    raison,
    dureeMinutes,
    date_ramassage,
    date_arrivee_hopital,
    carte_hopital,
    medications_notes,
    numero_assurance
  } = req.body;

  if (!raison) {
    return res.status(400).json({ message: "Raison obligatoire" });
  }

  const dateFin = new Date(Date.now() + (dureeMinutes || 60) * 60000);

  // Mise à jour du numéro d'assurance si fourni et non déjà enregistré
  if (numero_assurance) {
    const dossier = await prisma.dossierMedical.findUnique({
      where: { id_dossier: dossierId },
      include: { patient: true }
    });
    if (dossier && !dossier.patient.numero_assurance) {
      await prisma.patient.update({
        where: { id_patient: dossier.patient_id },
        data: { numero_assurance }
      });
    }
  }

  const acces = await prisma.accesUrgence.create({
    data: {
      raison,
      dossier_id: dossierId,
      utilisateur_id: req.user!.id,
      date_fin: dateFin,
      date_ramassage: date_ramassage ? new Date(date_ramassage) : undefined,
      date_arrivee_hopital: date_arrivee_hopital ? new Date(date_arrivee_hopital) : undefined,
      carte_hopital: carte_hopital || undefined,
      medications_notes: medications_notes || undefined,
    }
  });

  await logAudit(req, "CREATION", "AccesUrgence", acces.id_acces);

  res.status(201).json({
    message: "Accès urgence activé",
    expiration: dateFin
  });
}
