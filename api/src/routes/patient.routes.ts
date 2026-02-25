import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { checkPermission } from "../middlewares/permission.middleware";
import { prisma } from "../utils/prisma";
import bcrypt from "bcrypt";
import crypto from "crypto";

const router = Router();

router.use(authenticate);

// Liste des dossiers auxquels l'utilisateur connecté a accès
// L'ADMIN voit tous les dossiers avec droits complets
router.get("/dossiers", async (req, res) => {
  const userId = req.user!.id;
  const userRole = req.user!.role;

  if (userRole === "ADMIN") {
    const tous = await prisma.dossierMedical.findMany({
      include: { patient: true },
      orderBy: { date_creation: "desc" },
    });
    return res.json(tous.map((d) => ({
      id_dossier: d.id_dossier,
      etat: d.etat,
      patient: {
        nom: d.patient.nom,
        prenom: d.patient.prenom,
        date_naissance: d.patient.date_naissance,
        sexe: d.patient.sexe,
        numero_assurance: d.patient.numero_assurance,
      },
      permissions: { lecture: true, ajout: true, modification: true, suppression: true },
    })));
  }

  // Les médecins ne voient que les patients dont ils sont le médecin traitant
  if (userRole === "MEDECIN_GENERAL" || userRole === "MEDECIN_SPECIALISTE") {
    const dossiers = await prisma.dossierMedical.findMany({
      where: { medecin_traitant_id: userId },
      include: { patient: true },
      orderBy: { date_creation: "desc" },
    });
    return res.json(dossiers.map((d) => ({
      id_dossier: d.id_dossier,
      etat: d.etat,
      patient: {
        nom: d.patient.nom,
        prenom: d.patient.prenom,
        date_naissance: d.patient.date_naissance,
        sexe: d.patient.sexe,
        numero_assurance: d.patient.numero_assurance,
      },
      permissions: { lecture: true, ajout: true, modification: true, suppression: false },
    })));
  }

  const autorisations = await prisma.autorisationDossier.findMany({
    where: { utilisateur_id: userId, lecture: true },
    include: { dossier: { include: { patient: true } } },
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
    },
  }));

  res.json(dossiers);
});

// Profil patient par dossier ID (inclut médecin traitant)
router.get("/dossier/:dossierId", checkPermission("lecture"), async (req, res) => {
  const dossierId = req.params.dossierId as string;

  const dossier = await prisma.dossierMedical.findUnique({
    where: { id_dossier: dossierId },
    include: {
      patient: true,
      medecin_traitant: {
        select: {
          id_utilisateur: true,
          nom: true,
          prenom: true,
          role: true,
          institution: true,
        }
      }
    }
  });

  if (!dossier) {
    return res.status(404).json({ message: "Dossier non trouvé" });
  }

  res.json({
    ...dossier.patient,
    medecin_traitant: dossier.medecin_traitant,
  });
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

// Assigner le médecin traitant d'un dossier
router.put("/dossier/:dossierId/medecin-traitant", checkPermission("modification"), async (req, res) => {
  const dossierId = req.params.dossierId as string;
  const { medecin_traitant_id } = req.body;

  const dossier = await prisma.dossierMedical.findUnique({
    where: { id_dossier: dossierId },
  });

  if (!dossier) {
    return res.status(404).json({ message: "Dossier non trouvé" });
  }

  if (medecin_traitant_id) {
    const medecin = await prisma.utilisateur.findUnique({
      where: { id_utilisateur: medecin_traitant_id },
    });
    if (!medecin || !["MEDECIN_GENERAL", "MEDECIN_SPECIALISTE"].includes(medecin.role)) {
      return res.status(400).json({ message: "Médecin invalide" });
    }
  }

  const updated = await prisma.dossierMedical.update({
    where: { id_dossier: dossierId },
    data: { medecin_traitant_id: medecin_traitant_id || null },
    include: {
      medecin_traitant: {
        select: { id_utilisateur: true, nom: true, prenom: true, role: true, institution: true }
      }
    }
  });

  res.json({ medecin_traitant: updated.medecin_traitant });
});

// Créer un nouveau patient + dossier (réservé aux professionnels de santé)
router.post("/", async (req, res) => {
  const allowedRoles = ["ADMIN", "MEDECIN_GENERAL", "MEDECIN_SPECIALISTE", "INFIRMIER"];
  if (!allowedRoles.includes(req.user!.role)) {
    return res.status(403).json({ message: "Accès refusé" });
  }

  const { nom, prenom, date_naissance, sexe, numero_assurance, telephone, email } = req.body;

  if (!nom || !prenom || !date_naissance || !sexe) {
    return res.status(400).json({ message: "Nom, prénom, date de naissance et sexe sont obligatoires" });
  }

  const motDePasseTemporaire = email
    ? crypto.randomBytes(6).toString("hex")
    : undefined;

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

    // Autorisation du créateur
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

    // Compte patient si email fourni
    let compte = null;
    if (email && motDePasseTemporaire) {
      const hash = await bcrypt.hash(motDePasseTemporaire, 10);
      const utilisateur = await tx.utilisateur.create({
        data: {
          email,
          mot_de_passe: hash,
          nom,
          prenom,
          role: "PATIENT",
        }
      });
      // Autorisation lecture seule sur son propre dossier
      await tx.autorisationDossier.create({
        data: {
          utilisateur_id: utilisateur.id_utilisateur,
          dossier_id: dossier.id_dossier,
          lecture: true,
          ajout: false,
          modification: false,
          suppression: false,
        }
      });
      compte = { email, mot_de_passe_temporaire: motDePasseTemporaire };
    }

    return { patient, dossier, compte };
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
