import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

// ── Utilitaires ───────────────────────────────────────────────────────────────

function stripDosage(name: string): string {
  return name
    .replace(/\s+[\d.,]+\s*(mg|mcg|µg|ug|g|ml|l|iu|ui|mmol|meq|%)(\s*\/\s*(ml|g|l|mg|mcg))?\b/gi, "")
    .replace(/\s+\d+[\d.,]*\s*(unit|tablet|capsule|comprim[eé]|injection|solution|crème|creme|gel|poudre|sirop|spray|patch)\b/gi, "")
    .trim();
}

function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

interface DrugResult {
  drug_code: number;
  brand_name: string;
}

// ── Catalogue en mémoire ──────────────────────────────────────────────────────
// Chargé au démarrage du serveur en arrière-plan (26 requêtes a→z).
// Pendant le chargement, les recherches utilisent l'API Santé Canada directement.

let catalog: string[] = [];
let catalogReady = false;

async function buildCatalog(): Promise<void> {
  const seen = new Set<string>();
  const names: string[] = [];

  for (const letter of "abcdefghijklmnopqrstuvwxyz") {
    try {
      const url = `https://health-products.canada.ca/api/drug/drugproduct/?brandname=${letter}&lang=fr&type=json&class=Human`;
      const res = await fetch(url);
      if (!res.ok) continue;

      const raw: unknown = await res.json();
      const rows: Record<string, unknown>[] = Array.isArray(raw)
        ? (raw as Record<string, unknown>[])
        : Array.isArray((raw as Record<string, unknown>).data)
          ? ((raw as Record<string, unknown>).data as Record<string, unknown>[])
          : [];

      for (const d of rows) {
        if (d.class && d.class !== "Human") continue;
        const rawName = ((d.brand_name as string) || "").trim();
        if (!rawName) continue;
        const cleaned = toTitleCase(stripDosage(rawName));
        const key = cleaned.toLowerCase();
        if (cleaned && !seen.has(key)) {
          seen.add(key);
          names.push(cleaned);
        }
      }
    } catch {
      // ignore les erreurs par lettre, on continue
    }
    // Petite pause pour ne pas saturer l'API
    await new Promise((r) => setTimeout(r, 150));
  }

  catalog = names.sort((a, b) => a.localeCompare(b, "fr"));
  catalogReady = true;
  console.log(`[médicaments] Catalogue prêt : ${catalog.length} noms en mémoire`);
}

// Lancer le chargement en arrière-plan dès le démarrage
buildCatalog().catch(() => {});

// ── Cache TTL pour le fallback API (pendant le chargement) ────────────────────
const cache = new Map<string, { data: DrugResult[]; expiresAt: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (entry.expiresAt <= now) cache.delete(key);
  }
}, 10 * 60 * 1000).unref();

// ── Route de recherche ────────────────────────────────────────────────────────
router.get("/recherche", async (req, res) => {
  const q = ((req.query.q as string) || "").trim();
  if (q.length < 3) return res.json([]);

  const qLower = q.toLowerCase();

  // ── Catalogue prêt : recherche instantanée en mémoire ────────────────────
  if (catalogReady) {
    const prefixMatches: DrugResult[] = [];
    const containsMatches: DrugResult[] = [];

    catalog.forEach((name, i) => {
      const nameLower = name.toLowerCase();
      if (nameLower.startsWith(qLower)) {
        prefixMatches.push({ drug_code: i, brand_name: name });
      } else if (nameLower.includes(qLower)) {
        containsMatches.push({ drug_code: i, brand_name: name });
      }
    });

    return res.json([...prefixMatches, ...containsMatches]);
  }

  // ── Fallback : API Santé Canada pendant le chargement du catalogue ────────
  const now = Date.now();
  const cached = cache.get(qLower);
  if (cached && cached.expiresAt > now) return res.json(cached.data);

  try {
    const url = `https://health-products.canada.ca/api/drug/drugproduct/?brandname=${encodeURIComponent(q)}&lang=fr&type=json&class=Human`;
    const upstream = await fetch(url);
    if (!upstream.ok) return res.json([]);

    const raw: unknown = await upstream.json();
    const rows: Record<string, unknown>[] = Array.isArray(raw)
      ? (raw as Record<string, unknown>[])
      : Array.isArray((raw as Record<string, unknown>).data)
        ? ((raw as Record<string, unknown>).data as Record<string, unknown>[])
        : [];

    const seen = new Set<string>();
    const results: DrugResult[] = rows
      .filter((d) => {
        const rawName = ((d.brand_name as string) || "").trim();
        if (!rawName) return false;
        if (d.class && d.class !== "Human") return false;
        const cleaned = stripDosage(rawName).toLowerCase();
        if (!cleaned || seen.has(cleaned)) return false;
        seen.add(cleaned);
        return true;
      })
      .sort((a, b) => {
        const aClean = stripDosage((a.brand_name as string) || "").toLowerCase();
        const bClean = stripDosage((b.brand_name as string) || "").toLowerCase();
        if (aClean.startsWith(qLower) && !bClean.startsWith(qLower)) return -1;
        if (!aClean.startsWith(qLower) && bClean.startsWith(qLower)) return 1;
        return aClean.localeCompare(bClean, "fr");
      })
      .map((d) => ({
        drug_code: d.drug_code as number,
        brand_name: stripDosage((d.brand_name as string) || ""),
      }));

    cache.set(qLower, { data: results, expiresAt: now + CACHE_TTL_MS });
    res.json(results);
  } catch {
    res.json([]);
  }
});

export default router;
