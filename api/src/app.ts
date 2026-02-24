import express from "express";
import cors from "cors";
import consultationRoutes from "./routes/consultation.routes";
import authRoutes from "./routes/auth.routes";
import observationRoutes from "./routes/observation.routes";
import prescriptionRoutes from "./routes/prescription.routes";
import urgenceRoutes from "./routes/urgence.routes";
import patientRoutes from "./routes/patient.routes";
import hospitalisationRoutes from "./routes/hospitalisation.routes";
import medecinRoutes from "./routes/medecin.routes";
import adminRoutes from "./routes/admin.routes";
import medicamentRoutes from "./routes/medicament.routes";
import etablissementRoutes from "./routes/etablissement.routes";

const app = express();

app.use(cors({origin:["https://sante-quebec.vercel.app"],credentials:true}));
app.use(express.json());
app.use("/consultations", consultationRoutes);
app.use("/obeservations", observationRoutes);
app.use("/auth", authRoutes);
app.use("/prescriptions", prescriptionRoutes);
app.use("/urgence", urgenceRoutes);
app.use("/patients", patientRoutes);
app.use("/hospitalisations", hospitalisationRoutes);
app.use("/medecins", medecinRoutes);
app.use("/admin", adminRoutes);
app.use("/medicaments", medicamentRoutes);
app.use("/etablissements", etablissementRoutes);

export default app;
