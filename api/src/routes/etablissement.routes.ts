import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);


const CKAN_URL =
  "https://www.donneesquebec.ca/recherche/api/3/action/datastore_search" +
  "?resource_id=a1988030-1f8b-4c67-bc29-ca8b9f710afd" +
  "&limit=32000" +
  "&fields=ETAB_NOM,ADRESSE,CODE_POSTA,MUN_NOM";

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 heure

let cacheData: { ETAB_NOM: string; ADRESSE: string | null; CODE_POSTA: string | null; MUN_NOM: string | null }[] = [];
let cacheExpiry = 0;

async function fetchEtablissements() {
  if (Date.now() < cacheExpiry && cacheData.length > 0) return cacheData;

  const res = await fetch(CKAN_URL);
  if (!res.ok) throw new Error("CKAN indisponible");

  const json = (await res.json()) as {
    result: { records: { ETAB_NOM: string; ADRESSE: string | null; CODE_POSTA: string | null; MUN_NOM: string | null }[] };
  };

  cacheData = json.result.records.sort((a, b) => a.ETAB_NOM.localeCompare(b.ETAB_NOM, "fr"));
  cacheExpiry = Date.now() + CACHE_TTL_MS;
  return cacheData;
}

// GET /etablissements — liste complète (filtrée optionnellement par ?q=)
router.get("/", async (req, res) => {
  try {
    const records = await fetchEtablissements();
    const q = (req.query.q as string | undefined)?.toLowerCase().trim();

    const filtered = q
      ? records.filter((r) => r.ETAB_NOM.toLowerCase().includes(q))
      : records;

    res.json(filtered);
  } catch {
    res.json([]); // En cas d'indisponibilité, ne pas bloquer l'UI
  }
});

export default router;
