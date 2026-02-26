import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

// ── Cache par requête (30 min TTL) ────────────────────────────────────────────
interface EtabResult {
  ETAB_NOM: string;
  ADRESSE: string | null;
  MUN_NOM: string | null;
  CODE_POSTA: string | null;
}

const cache = new Map<string, { data: EtabResult[]; expiresAt: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of cache.entries()) {
    if (v.expiresAt <= now) cache.delete(k);
  }
}, 15 * 60 * 1000).unref();

// ── Nominatim (OpenStreetMap) ─────────────────────────────────────────────────
interface NominatimResult {
  display_name: string;
  name?: string;
  type: string;
  class: string;
  address: {
    amenity?: string;
    house_number?: string;
    road?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    postcode?: string;
  };
}

function extractNom(r: NominatimResult): string {
  return (
    r.address?.amenity ||
    r.name ||
    r.display_name.split(",")[0]
  ).trim();
}

router.get("/", async (req, res) => {
  const q = ((req.query.q as string) || "").trim();
  if (q.length < 2) return res.json([]);

  const key = q.toLowerCase();
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) return res.json(cached.data);

  try {
    const params = new URLSearchParams({
      q,
      format: "json",
      addressdetails: "1",
      countrycodes: "ca",
      limit: "8",
      "accept-language": "fr",
    });

    const upstream = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      {
        headers: {
          // Nominatim exige un User-Agent identifiable
          "User-Agent": "Sante-Quebec/1.0 (projet educatif)",
          "Accept-Language": "fr",
        },
      }
    );

    if (!upstream.ok) return res.json([]);

    const results: NominatimResult[] = await upstream.json();

    const data: EtabResult[] = results.map((r) => ({
      ETAB_NOM: extractNom(r),
      ADRESSE:
        [r.address?.house_number, r.address?.road].filter(Boolean).join(" ") ||
        null,
      MUN_NOM:
        r.address?.city ||
        r.address?.town ||
        r.address?.village ||
        r.address?.municipality ||
        r.address?.county ||
        null,
      CODE_POSTA: r.address?.postcode || null,
    }));

    cache.set(key, { data, expiresAt: Date.now() + 30 * 60 * 1000 });
    res.json(data);
  } catch {
    res.json([]);
  }
});

export default router;
