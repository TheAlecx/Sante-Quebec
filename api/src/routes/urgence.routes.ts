import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { activerUrgence } from "../controllers/urgence.controller";

const router = Router();

router.use(authenticate);

router.post("/dossier/:dossierId", activerUrgence);

export default router;
