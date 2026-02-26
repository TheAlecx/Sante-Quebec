import { Request, Response } from "express";
import { Sexe } from "@prisma/client";
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

// Crée un dossier d'admission (Hospitalisation) depuis le flux urgence,
// sans passer par checkPermission — utilisé par les ambulanciers.
export async function creerAdmission(req: Request, res: Response) {
  const dossierId = Array.isArray(req.params.dossierId) ? req.params.dossierId[0] : req.params.dossierId;
  const {
    date_admission,
    etablissement,
    service,
    motif,
    resume,
    medecin_traitant,
    date_sortie,
    numero_assurance,
  } = req.body;

  if (!date_admission || !etablissement || !service || !motif || !resume) {
    return res.status(400).json({ message: "Champs obligatoires manquants (date_admission, etablissement, service, motif, resume)" });
  }

  // Créer un patient/dossier anonyme si le dossier n'existe pas encore (mode manuel)
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
        sexe: Sexe.HOMME,
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
    await prisma.patient.update({
      where: { id_patient: dossierExistant.patient_id },
      data: { numero_assurance },
    });
  }

  const hospitalisation = await prisma.hospitalisation.create({
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

  await logAudit(req, "CREATION", "Hospitalisation", hospitalisation.id_hospitalisation);

  res.status(201).json(hospitalisation);
}
