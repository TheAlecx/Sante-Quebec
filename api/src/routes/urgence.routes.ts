import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { activerUrgence, creerAdmission, rechercherPatient } from "../controllers/urgence.controller";

const router = Router();

router.use(authenticate);

router.get("/recherche/:numeroAssurance", rechercherPatient);
router.post("/admission/:dossierId", creerAdmission);
router.post("/dossier/:dossierId", activerUrgence); // conservé pour compatibilité

export default router;
