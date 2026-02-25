/**
 * Import du catalogue de médicaments depuis l'API Santé Canada (DPD).
 *
 * Usage (depuis le dossier api/) :
 *   npx ts-node --project prisma/tsconfig.json prisma/import-medicaments.ts
 *
 * Requiert que la migration `add_catalog_medicament` ait déjà été exécutée :
 *   npx prisma migrate dev --name add_catalog_medicament
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Retire les dosages du nom (ex: "ASPIRIN 81MG" → "Aspirin")
function stripDosage(name: string): string {
  return name
    .replace(/\s+[\d.,]+\s*(mg|mcg|µg|ug|g|ml|l|iu|ui|mmol|meq|%)(\s*\/\s*(ml|g|l|mg|mcg))?\b/gi, "")
    .replace(/\s+\d+[\d.,]*\s*(unit|tablet|capsule|comprim[eé]|injection|solution|crème|creme|gel|poudre|sirop|spray|patch)\b/gi, "")
    .trim();
}

function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

async function fetchForPrefix(prefix: string): Promise<string[]> {
  try {
    const url = `https://health-products.canada.ca/api/drug/drugproduct/?brandname=${encodeURIComponent(prefix)}&lang=fr&type=json&class=Human`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const raw: unknown = await res.json();
    const rows = Array.isArray(raw) ? raw : (Array.isArray((raw as Record<string, unknown>).data) ? (raw as Record<string, unknown>).data as unknown[] : []);

    const names: string[] = [];
    for (const d of rows as Record<string, unknown>[]) {
      if (d.class && d.class !== "Human") continue;
      const rawName = ((d.brand_name as string) || "").trim();
      if (!rawName) continue;
      const cleaned = toTitleCase(stripDosage(rawName));
      if (cleaned) names.push(cleaned);
    }
    return names;
  } catch {
    return [];
  }
}

async function main() {
  console.log("🔄 Début de l'import du catalogue de médicaments...\n");

  // Vider le catalogue existant
  await prisma.catalogMedicament.deleteMany({});
  console.log("✓ Catalogue existant vidé.\n");

  const seen = new Set<string>();
  const toInsert: string[] = [];

  // Requêter l'API pour chaque lettre a-z (26 requêtes)
  const letters = "abcdefghijklmnopqrstuvwxyz".split("");
  let done = 0;

  for (const letter of letters) {
    const names = await fetchForPrefix(letter);
    for (const name of names) {
      const key = name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        toInsert.push(name);
      }
    }
    done++;
    process.stdout.write(`\r  Progression : ${done}/26 lettres (${toInsert.length} médicaments uniques trouvés)`);
    // Petite pause pour ne pas surcharger l'API
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log("\n");

  // Insertion par lots de 500
  const BATCH = 500;
  let inserted = 0;
  for (let i = 0; i < toInsert.length; i += BATCH) {
    const batch = toInsert.slice(i, i + BATCH);
    await prisma.catalogMedicament.createMany({
      data: batch.map((nom) => ({ nom })),
      skipDuplicates: true,
    });
    inserted += batch.length;
    process.stdout.write(`\r  Insertion : ${inserted}/${toInsert.length}`);
  }

  console.log(`\n\n✅ Import terminé : ${inserted} médicaments importés dans CatalogMedicament.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
