import express from "express";
import cors from "cors";
import consultationRoutes from "./routes/consultation.routes";
import authRoutes from "./routes/auth.routes";
import observationRoutes from "./routes/observation.routes";
import prescriptionRoutes from "./routes/prescription.routes";
import urgenceRoutes from "./routes/urgence.routes";
import patientRoutes from "./routes/patient.routes";
import hospitalisationRoutes from "./routes/hospitalisation.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/consultations", consultationRoutes);
app.use("/obeservations", observationRoutes);
app.use("/auth", authRoutes);
app.use("/prescriptions", prescriptionRoutes);
app.use("/urgence", urgenceRoutes);
app.use("/patients", patientRoutes);
app.use("/hospitalisations", hospitalisationRoutes);

export default app;
