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
    numero_assurance,
    rapport_data,
  } = req.body;

  if (!raison) {
    return res.status(400).json({ message: "Raison obligatoire" });
  }

  const dateFin = new Date(Date.now() + (dureeMinutes || 60) * 60000);

  // Vérifier si le dossier existe ; sinon, créer un patient/dossier anonyme (mode manuel)
  const dossierExistant = await prisma.dossierMedical.findUnique({
    where: { id_dossier: dossierId },
    include: { patient: true },
  });

  if (!dossierExistant) {
    const patientAnonyme = await prisma.patient.create({
      data: {
        nom: "Non identifié",
        prenom: "Patient",
        date_naissance: new Date(),
        sexe: "INCONNU",
        numero_assurance: numero_assurance || null,
      },
    });
    await prisma.dossierMedical.create({
      data: {
        id_dossier: dossierId,
        patient_id: patientAnonyme.id_patient,
        etat: "ACTIF",
      },
    });
  } else if (numero_assurance && !dossierExistant.patient.numero_assurance) {
    // Mise à jour du numéro d'assurance si fourni et non déjà enregistré
    await prisma.patient.update({
      where: { id_patient: dossierExistant.patient_id },
      data: { numero_assurance },
    });
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
      rapport_data: rapport_data ?? undefined,
    }
  });

  await logAudit(req, "CREATION", "AccesUrgence", acces.id_acces);

  res.status(201).json({
    message: "Accès urgence activé",
    expiration: dateFin
  });
}
