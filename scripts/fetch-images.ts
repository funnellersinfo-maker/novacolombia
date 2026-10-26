/**
 * fetch-images.ts — Agente de assets (Task 3-a)
 *
 * Para cada producto de seedProducts ejecuta:
 *   z-ai image-search --query "<imageQuery>" --count 3 --gl us --no-rank
 * con concurrencia máxima de 3 procesos.
 *
 * - Parsea el JSON de stdout ({ success, results: [{ original_url, ... }] }).
 * - Toma hasta 3 `original_url` (URLs OSS) por producto.
 * - Si falla (success false / sin resultados / error de proceso), reintenta UNA
 *   vez con la consulta simplificada (primeras 3 palabras del imageQuery).
 * - Si vuelve a fallar, omite el producto del mapa.
 *
 * Salidas:
 *   - /home/z/my-project/data/image-map.json  → { "<slug>": ["url1", ...] }
 *   - /tmp/fetch-progress.log                 → una línea por producto completado
 */

import { spawn } from "node:child_process";
import { appendFileSync, writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { seedProducts } from "../data/catalog";

const CLI = "z-ai";
const CONCURRENCY = 3;
const PER_CALL_TIMEOUT_MS = 100_000; // hasta ~90s por llamada según spec
const MAX_URLS = 3;

const ROOT = path.resolve(import.meta.dir, "..");
const MAP_PATH = path.join(ROOT, "data", "image-map.json");
const PROGRESS_LOG = "/tmp/fetch-progress.log";

type SearchResult = {
  success?: boolean;
  results?: Array<{ original_url?: string }>;
};

/** Extrae el primer objeto JSON parseable del stdout (hay líneas de banner antes). */
function extractJson(stdout: string): SearchResult | null {
  let idx = stdout.indexOf("{");
  while (idx !== -1) {
    const candidate = stdout.slice(idx);
    try {
      return JSON.parse(candidate) as SearchResult;
    } catch {
      idx = stdout.indexOf("{", idx + 1);
    }
  }
  return null;
}

/** Ejecuta `z-ai image-search ...` y devuelve hasta MAX_URLS original_url, o null si falla. */
function searchOnce(query: string): Promise<string[] | null> {
  return new Promise((resolve) => {
    const args = [
      "image-search",
      "--query", query,
      "--count", String(MAX_URLS),
      "--gl", "us",
      "--no-rank",
    ];
    const child = spawn(CLI, args, { stdio: ["ignore", "pipe", "pipe"] });

    let stdout = "";
    let stderr = "";
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        child.kill("SIGKILL");
        resolve(null);
      }
    }, PER_CALL_TIMEOUT_MS);

    child.stdout.on("data", (d: Buffer) => (stdout += d.toString()));
    child.stderr.on("data", (d: Buffer) => (stderr += d.toString()));
    child.on("error", (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      appendFileSync(PROGRESS_LOG, `  [proc-error] ${query}: ${err.message}\n`);
      resolve(null);
    });
    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      const parsed = extractJson(stdout);
      const urls =
        parsed?.success === true && Array.isArray(parsed.results)
          ? parsed.results
              .map((r) => (typeof r?.original_url === "string" ? r.original_url : ""))
              .filter((u) => u.length > 0)
              .slice(0, MAX_URLS)
          : [];
      if (code === 0 && urls.length > 0) {
        resolve(urls);
      } else {
        if (code !== 0) {
          appendFileSync(
            PROGRESS_LOG,
            `  [exit ${code}] ${query}: ${(stderr || stdout).slice(0, 160).replace(/\n/g, " ")}\n`
          );
        } else if (parsed?.success !== true || urls.length === 0) {
          appendFileSync(PROGRESS_LOG, `  [no-results] ${query}\n`);
        }
        resolve(null);
      }
    });
  });
}

/** Búsqueda con reintento único usando consulta simplificada (primeras 3 palabras). */
async function searchWithRetry(imageQuery: string): Promise<string[] | null> {
  const primary = await searchOnce(imageQuery);
  if (primary) return primary;

  const simplified = imageQuery.trim().split(/\s+/).slice(0, 3).join(" ");
  if (simplified && simplified.toLowerCase() !== imageQuery.trim().toLowerCase()) {
    appendFileSync(PROGRESS_LOG, `  [retry-simplified] "${simplified}"\n`);
    return searchOnce(simplified);
  }
  return null;
}

function log(line: string) {
  appendFileSync(PROGRESS_LOG, line + "\n");
}

async function main() {
  mkdirSync(path.dirname(MAP_PATH), { recursive: true });
  writeFileSync(PROGRESS_LOG, `# fetch-images start ${new Date().toISOString()} — ${seedProducts.length} products\n`);

  // Modo reanudable: si ya existe un mapa válido, se conservan sus entradas y solo
  // se buscan los slugs pendientes (útil para recuperar fallos transitorios).
  const map: Record<string, string[]> = {};
  if (existsSync(MAP_PATH)) {
    try {
      const prev = JSON.parse(readFileSync(MAP_PATH, "utf-8"));
      if (prev && typeof prev === "object") {
        for (const [k, v] of Object.entries(prev)) {
          if (Array.isArray(v) && v.every((u) => typeof u === "string" && u.length > 0)) {
            map[k] = v.slice(0, MAX_URLS);
          }
        }
      }
      log(`# resume: ${Object.keys(map).length} slugs ya mapeados, se omiten`);
    } catch {
      log(`# resume: image-map.json existente no es JSON válido, se parte de cero`);
    }
  }

  const failed: string[] = [];
  const pending = seedProducts.filter((p) => !map[p.slug] || map[p.slug].length === 0);
  let completed = 0;
  const total = pending.length;
  log(`# a buscar en esta pasada: ${total} productos`);

  // Pool de concurrencia fija (nunca más de CONCURRENCY procesos simultáneos)
  const queue = [...pending];
  const workers = Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async (_, i) => {
    // Desfase inicial para evitar ráfaga de peticiones que dispara errores transitorios
    await new Promise((r) => setTimeout(r, i * 1500));
    while (queue.length > 0) {
      const product = queue.shift();
      if (!product) break;
      const urls = await searchWithRetry(product.imageQuery);
      if (urls && urls.length > 0) {
        map[product.slug] = urls;
        log(`OK [${++completed}/${total}] ${product.slug} (${urls.length} urls)`);
      } else {
        failed.push(product.slug);
        log(`FAIL [${++completed}/${total}] ${product.slug} — omitted`);
      }
      // Escritura incremental (protege el avance ante caídas del proceso)
      writeFileSync(MAP_PATH, JSON.stringify(map, null, 2) + "\n");
      // Pausa breve entre llamadas del mismo worker para suavizar la tasa
      await new Promise((r) => setTimeout(r, 500));
    }
  });

  await Promise.all(workers);

  writeFileSync(MAP_PATH, JSON.stringify(map, null, 2) + "\n");
  const mappedTotal = Object.keys(map).length;
  log(
    `# fetch-images done ${new Date().toISOString()} — mapped ${mappedTotal}/${seedProducts.length} total, failed this pass ${failed.length}` +
      (failed.length ? ` (${failed.join(", ")})` : "")
  );
  console.log(`DONE: mapped ${mappedTotal}/${seedProducts.length} products; failed this pass: ${failed.length}`);
  if (failed.length) console.log("Failed slugs:", failed.join(", "));
}

main().catch((err) => {
  console.error("FATAL:", err);
  appendFileSync(PROGRESS_LOG, `# FATAL ${err?.stack || err}\n`);
  process.exit(1);
});
