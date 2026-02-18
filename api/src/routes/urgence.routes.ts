import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { activerUrgence, rechercherPatient } from "../controllers/urgence.controller";

const router = Router();

router.use(authenticate);

router.get("/recherche/:numeroAssurance", rechercherPatient);
router.post("/dossier/:dossierId", activerUrgence);

export default router;
