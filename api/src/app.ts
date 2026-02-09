import express from "express";
import cors from "cors";
import consultationRoutes from "./routes/consultation.routes";
import authRoutes from "./routes/auth.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/consultations", consultationRoutes);
    
app.use("/auth", authRoutes);

export default app;
