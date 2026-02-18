import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { checkPermission } from "../middlewares/permission.middleware";
import { prisma } from "../utils/prisma";

const router = Router();

router.use(authenticate);

// Liste des dossiers auxquels l'utilisateur connecté a accès
router.get("/dossiers", async (req, res) => {
  const userId = req.user!.id;

  const autorisations = await prisma.autorisationDossier.findMany({
    where: { utilisateur_id: userId, lecture: true },
    include: {
      dossier: {
        include: {
          patient: true
        }
      }
    }
  });

  const dossiers = autorisations.map((a) => ({
    id_dossier: a.dossier.id_dossier,
    etat: a.dossier.etat,
    patient: {
      nom: a.dossier.patient.nom,
      prenom: a.dossier.patient.prenom,
      date_naissance: a.dossier.patient.date_naissance,
      sexe: a.dossier.patient.sexe,
      numero_assurance: a.dossier.patient.numero_assurance,
    },
    permissions: {
      lecture: a.lecture,
      ajout: a.ajout,
      modification: a.modification,
      suppression: a.suppression,
    }
  }));

  res.json(dossiers);
});

// Profil patient par dossier ID
router.get("/dossier/:dossierId", checkPermission("lecture"), async (req, res) => {
  const dossierId = req.params.dossierId as string;

  const dossier = await prisma.dossierMedical.findUnique({
    where: { id_dossier: dossierId },
    include: { patient: true }
  }) as any;

  if (!dossier) {
    return res.status(404).json({ message: "Dossier non trouvé" });
  }

  res.json(dossier.patient);
});

// Modifier le profil patient par dossier ID
router.put("/dossier/:dossierId", checkPermission("modification"), async (req, res) => {
  const dossierId = req.params.dossierId as string;
  const { nom, prenom, date_naissance, sexe, numero_assurance, telephone, adresse, taille_cm, poids_kg, contact_urgence_nom, contact_urgence_telephone, contact_urgence_lien, pharmacie_nom, pharmacie_telephone, pharmacie_adresse } = req.body;

  const dossier = await prisma.dossierMedical.findUnique({
    where: { id_dossier: dossierId },
  });

  if (!dossier) {
    return res.status(404).json({ message: "Dossier non trouvé" });
  }

  const updated = await prisma.patient.update({
    where: { id_patient: dossier.patient_id },
    data: {
      ...(nom !== undefined && { nom }),
      ...(prenom !== undefined && { prenom }),
      ...(date_naissance !== undefined && { date_naissance: new Date(date_naissance) }),
      ...(sexe !== undefined && { sexe }),
      ...(numero_assurance !== undefined && { numero_assurance }),
      ...(telephone !== undefined && { telephone }),
      ...(adresse !== undefined && { adresse }),
      ...(taille_cm !== undefined && { taille_cm: taille_cm ? parseInt(taille_cm) : null }),
      ...(poids_kg !== undefined && { poids_kg: poids_kg ? parseFloat(poids_kg) : null }),
      ...(contact_urgence_nom !== undefined && { contact_urgence_nom }),
      ...(contact_urgence_telephone !== undefined && { contact_urgence_telephone }),
      ...(contact_urgence_lien !== undefined && { contact_urgence_lien }),
      ...(pharmacie_nom !== undefined && { pharmacie_nom }),
      ...(pharmacie_telephone !== undefined && { pharmacie_telephone }),
      ...(pharmacie_adresse !== undefined && { pharmacie_adresse }),
    }
  });

  res.json(updated);
});

// Créer un nouveau patient + dossier (réservé aux professionnels de santé)
router.post("/", async (req, res) => {
  const allowedRoles = ["ADMIN", "MEDECIN_GENERAL", "MEDECIN_SPECIALISTE", "INFIRMIER"];
  if (!allowedRoles.includes(req.user!.role)) {
    return res.status(403).json({ message: "Accès refusé" });
  }

  const { nom, prenom, date_naissance, sexe, numero_assurance, telephone } = req.body;

  if (!nom || !prenom || !date_naissance || !sexe) {
    return res.status(400).json({ message: "Nom, prénom, date de naissance et sexe sont obligatoires" });
  }

  const result = await prisma.$transaction(async (tx) => {
    const patient = await tx.patient.create({
      data: {
        nom,
        prenom,
        date_naissance: new Date(date_naissance),
        sexe,
        ...(numero_assurance && { numero_assurance }),
        ...(telephone && { telephone }),
      }
    });

    const dossier = await tx.dossierMedical.create({
      data: {
        patient_id: patient.id_patient,
        etat: "ACTIF"
      }
    });

    await tx.autorisationDossier.create({
      data: {
        utilisateur_id: req.user!.id,
        dossier_id: dossier.id_dossier,
        lecture: true,
        ajout: true,
        modification: true,
        suppression: false,
      }
    });

    return { patient, dossier };
  });

  res.status(201).json(result);
});

// Profil patient de l'utilisateur connecté
router.get("/me", async (req, res) => {
  const userId = req.user!.id;

  const patient = await prisma.patient.findFirst({
    where: {
      dossier: {
        autorisations: {
          some: {
            utilisateur_id: userId
          }
        }
      }
    },
    include: {
      dossier: true
    }
  });

  res.json(patient);
});

export default router;
