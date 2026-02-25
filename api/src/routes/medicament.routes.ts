import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

// ── Cache TTL en mémoire ──────────────────────────────────────────────────────
// Clé = terme de recherche normalisé, valeur = résultats + timestamp d'expiration
const cache = new Map<string, { data: DrugResult[]; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Nettoyer les entrées expirées toutes les 10 minutes pour éviter la fuite mémoire
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (entry.expiresAt <= now) cache.delete(key);
  }
}, 10 * 60 * 1000).unref();

interface DrugResult {
  drug_code: number;
  brand_name: string;
}

// Proxy vers l'API Santé Canada — évite les restrictions CORS côté navigateur
router.get("/recherche", async (req, res) => {
  const q = ((req.query.q as string) || "").trim();

  if (q.length < 2) return res.json([]);

  // Chercher dans le cache d'abord
  const key = q.toLowerCase();
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && cached.expiresAt > now) {
    return res.json(cached.data);
  }

  try {
    // limit=20 : on demande seulement 20 résultats à l'API pour réduire la taille
    // de la réponse et accélérer le transfert. On en garde 8 après filtrage.
    const url = `https://health-products.canada.ca/api/drug/drugproduct/?brandname=${encodeURIComponent(q)}&lang=fr&type=json&limit=20`;
    const upstream = await fetch(url, { signal: AbortSignal.timeout(5000) });

    if (!upstream.ok) return res.json([]);

    const raw: unknown = await upstream.json();
    const rows: Record<string, unknown>[] = Array.isArray(raw)
      ? (raw as Record<string, unknown>[])
      : [];

    const results: DrugResult[] = rows
      .filter((d) => !d.class || d.class === "Human")
      .slice(0, 8)
      .map((d) => ({
        drug_code: d.drug_code as number,
        brand_name: d.brand_name as string,
      }));

    // Mettre en cache avant de répondre
    cache.set(key, { data: results, expiresAt: now + CACHE_TTL_MS });

    res.json(results);
  } catch {
    res.json([]);
  }
});

export default router;
