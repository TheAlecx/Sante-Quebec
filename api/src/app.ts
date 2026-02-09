import express from "express";
import cors from "cors";
import consultationRoutes from "./routes/consultation.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/consultations", consultationRoutes);

export default app;
