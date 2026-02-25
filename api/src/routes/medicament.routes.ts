import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

// ── Cache TTL en mémoire ──────────────────────────────────────────────────────
const cache = new Map<string, { data: DrugResult[]; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

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

// Retire les informations de dosage du nom de marque
// Ex: "ASPIRIN 81MG" → "Aspirin", "TYLENOL EXTRA STRENGTH 500MG" → "Tylenol Extra Strength"
function stripDosage(name: string): string {
  return name
    .replace(/\s+[\d.,]+\s*(mg|mcg|µg|ug|g|ml|l|iu|ui|mmol|meq|%)(\s*\/\s*(ml|g|l|mg|mcg))?\b/gi, "")
    .replace(/\s+\d+[\d.,]*\s*(unit|tablet|capsule|comprim[eé]|injection|solution|crème|creme|gel|poudre|sirop|spray|patch)\b/gi, "")
    .trim();
}

// Proxy vers l'API Santé Canada — évite les restrictions CORS côté navigateur
router.get("/recherche", async (req, res) => {
  const q = ((req.query.q as string) || "").trim();

  if (q.length < 2) return res.json([]);

  const key = q.toLowerCase();
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && cached.expiresAt > now) {
    return res.json(cached.data);
  }

  try {
    const url = `https://health-products.canada.ca/api/drug/drugproduct/?brandname=${encodeURIComponent(q)}&lang=fr&type=json`;
    const upstream = await fetch(url);

    if (!upstream.ok) return res.json([]);

    const raw: unknown = await upstream.json();
    const rows: Record<string, unknown>[] = Array.isArray(raw)
      ? (raw as Record<string, unknown>[])
      : Array.isArray((raw as Record<string, unknown>).data)
        ? ((raw as Record<string, unknown>).data as Record<string, unknown>[])
        : [];

    // 1. Médicaments humains avec un nom seulement
    // 2. Retirer le dosage du nom, dédupliquer par nom nettoyé
    // 3. Trier : les résultats qui commencent par la requête en premier, puis alphabétique
    const seen = new Set<string>();
    const qLower = key;

    const results: DrugResult[] = rows
      .filter((d) => {
        const raw = ((d.brand_name as string) || "").trim();
        if (!raw) return false;
        if (d.class && d.class !== "Human") return false;
        const cleaned = stripDosage(raw).toLowerCase();
        if (!cleaned || seen.has(cleaned)) return false;
        seen.add(cleaned);
        return true;
      })
      .sort((a, b) => {
        const aClean = stripDosage((a.brand_name as string) || "").toLowerCase();
        const bClean = stripDosage((b.brand_name as string) || "").toLowerCase();
        const aStarts = aClean.startsWith(qLower);
        const bStarts = bClean.startsWith(qLower);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return aClean.localeCompare(bClean, "fr");
      })
      .slice(0, 8)
      .map((d) => ({
        drug_code: d.drug_code as number,
        brand_name: stripDosage((d.brand_name as string) || ""),
      }));

    cache.set(key, { data: results, expiresAt: now + CACHE_TTL_MS });
    res.json(results);
  } catch {
    res.json([]);
  }
});

export default router;
