import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

// Proxy vers l'API Santé Canada — évite les restrictions CORS côté navigateur
router.get("/recherche", async (req, res) => {
  const q = req.query.q as string;

  if (!q || q.trim().length < 2) {
    return res.json([]);
  }

  try {
    const url = `https://health-products.canada.ca/api/drug/drugproduct/?brandname=${encodeURIComponent(q.trim())}&lang=fr&type=json`;
    const upstream = await fetch(url);

    if (!upstream.ok) {
      return res.json([]);
    }

    const data: unknown[] = await upstream.json();

    const filtered = Array.isArray(data)
      ? data
          .filter((d: unknown) => {
            const rec = d as Record<string, unknown>;
            return !rec.class || rec.class === "Human";
          })
          .slice(0, 8)
      : [];

    res.json(filtered);
  } catch {
    res.json([]);
  }
});

export default router;
