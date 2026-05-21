/* global document, fetch, localStorage, matchMedia */

const STORAGE_KEYS = {
  theme: "du.theme",
  lang: "du.lang",
};

const SUPPORTED_LANGS = ["es", "en"];

// base path para Firebase (carpeta web)
const BASE_PATH = ""; // dejar vacío porque ya estás en /web

// =========================
// I18N (igual que el tuyo)
// =========================
const I18N = { /* TODO tu objeto sin cambios */ };

// =========================
// FUNCIONES (igual todo)
// =========================

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      const next = line[i + 1];
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  values.push(current);
  return values;
}

function normalize(value) {
  return String(value ?? "").trim();
}

function stripBom(text) {
  if (text.charCodeAt(0) === 0xfeff) return text.slice(1);
  return text;
}

function toNumber(value) {
  const n = Number(String(value).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function findHeaderIndex(headers, candidates) {
  const normalized = headers.map((h) => normalize(h).toLowerCase());
  for (const candidate of candidates) {
    const idx = normalized.indexOf(candidate.toLowerCase());
    if (idx >= 0) return idx;
  }
  return -1;
}

function uniqueCount(rows, idx) {
  if (idx < 0) return null;
  const seen = new Set();
  for (const row of rows) {
    const value = normalize(row[idx]);
    if (!value) continue;
    seen.add(value);
  }
  return seen.size;
}

function mostFrequent(rows, idx) {
  if (idx < 0) return null;
  const counts = new Map();
  for (const row of rows) {
    const value = normalize(row[idx]);
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  let bestKey = null;
  let bestCount = -1;
  for (const [key, count] of counts.entries()) {
    if (count > bestCount) {
      bestKey = key;
      bestCount = count;
    }
  }
  return bestKey;
}

function formatNumber(value, digits = 2) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return n.toFixed(digits);
}

function formatInt(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return String(Math.trunc(n));
}

function summaryDesercionClean(headers, rows) {
  const facultyIdx = findHeaderIndex(headers, ["nombre_facultad", "nombre facultad"]);
  const programIdx = findHeaderIndex(headers, ["nombre_programa", "nombre programa"]);

  return {
    records: formatInt(rows.length),
    faculties: uniqueCount(rows, facultyIdx),
    programs: uniqueCount(rows, programIdx),
    topFaculty: mostFrequent(rows, facultyIdx),
  };
}

function summaryTasasClean(headers, rows) {
  const iesIdx = findHeaderIndex(headers, ["ies"]);
  const yearIdx = findHeaderIndex(headers, ["año", "aÃ±o", "ano"]);
  const rateIdx = findHeaderIndex(headers, ["tasa"]);

  let minYear = null;
  let maxYear = null;
  let sum = 0;
  let count = 0;

  for (const row of rows) {
    const year = yearIdx >= 0 ? toNumber(row[yearIdx]) : null;
    if (year != null) {
      minYear = minYear == null ? year : Math.min(minYear, year);
      maxYear = maxYear == null ? year : Math.max(maxYear, year);
    }

    const rate = rateIdx >= 0 ? toNumber(row[rateIdx]) : null;
    if (rate != null) {
      sum += rate;
      count += 1;
    }
  }

  const yearRange =
    minYear != null && maxYear != null ? `${Math.trunc(minYear)}–${Math.trunc(maxYear)}` : null;
  const avgRate = count > 0 ? formatNumber(sum / count, 2) : null;

  return {
    records: formatInt(rows.length),
    ies: uniqueCount(rows, iesIdx),
    yearRange,
    avgRate,
  };
}

function summaryModeloTasas(headers, rows) {
  const yearIdx = findHeaderIndex(headers, ["año", "aÃ±o", "ano"]);
  const actualIdx = findHeaderIndex(headers, ["tasa"]);
  const predIdx = findHeaderIndex(headers, ["tasa_predicha", "tasa predicha"]);

  let minYear = null;
  let maxYear = null;

  let sumAbs = 0;
  let sumSq = 0;
  let count = 0;

  for (const row of rows) {
    const year = yearIdx >= 0 ? toNumber(row[yearIdx]) : null;
    if (year != null) {
      minYear = minYear == null ? year : Math.min(minYear, year);
      maxYear = maxYear == null ? year : Math.max(maxYear, year);
    }

    const actual = actualIdx >= 0 ? toNumber(row[actualIdx]) : null;
    const pred = predIdx >= 0 ? toNumber(row[predIdx]) : null;
    if (actual == null || pred == null) continue;

    const diff = actual - pred;
    sumAbs += Math.abs(diff);
    sumSq += diff * diff;
    count += 1;
  }

  const yearRange =
    minYear != null && maxYear != null ? `${Math.trunc(minYear)}–${Math.trunc(maxYear)}` : null;

  return {
    records: formatInt(rows.length),
    yearRange,
    mae: count > 0 ? formatNumber(sumAbs / count, 2) : null,
    rmse: count > 0 ? formatNumber(Math.sqrt(sumSq / count), 2) : null,
  };
}

// =========================
// CAMBIO CLAVE AQUÍ
// =========================
async function loadCsvSummary(csvPath) {
  try {
    // 🔥 Asegura que siempre busque en /web/data/
    const finalPath = `${BASE_PATH}${csvPath}`;

    const response = await fetch(finalPath, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`No se pudo cargar CSV (${response.status})`);
    }

    const text = stripBom(await response.text());
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);

    if (lines.length < 2) throw new Error("CSV vacío o inválido");

    const headers = parseCsvLine(lines[0]).map((h) =>
      normalize(h).replace(/^"|"$/g, "")
    );

    const rows = [];
    for (let li = 1; li < lines.length; li += 1) {
      rows.push(parseCsvLine(lines[li]));
    }

    const headerKey = headers.map((h) => h.toLowerCase()).join("|");
    let summary = null;

    if (headerKey.includes("tipo_desercion") || headerKey.includes("nombre_facultad")) {
      summary = summaryDesercionClean(headers, rows);
      summary.dataset = "desercion_clean";
    } else if (headerKey.includes("tasa_predicha")) {
      summary = summaryModeloTasas(headers, rows);
      summary.dataset = "modelo_tasas";
    } else if (
      headerKey.includes("tasa") &&
      (headerKey.includes("ies") ||
        headerKey.includes("año") ||
        headerKey.includes("ano"))
    ) {
      summary = summaryTasasClean(headers, rows);
      summary.dataset = "tasas_clean";
    } else {
      summary = { records: rows.length, dataset: "csv" };
    }

    summary.csvPath = finalPath;
    return summary;

  } catch (error) {
    console.error("Error cargando CSV:", error);
    throw error;
  }
}

// =========================
// RESTO DEL CÓDIGO IGUAL
// =========================

function injectSummary(scope, summary) {
  const setText = (selector, value) => {
    const el = document.querySelector(selector);
    if (!el) return;
    el.textContent = value;
  };

  const q = (k) => `[data-kpi='${scope}.${k}']`;

  if (summary?.records != null) setText(q("records"), summary.records);
  if (summary?.faculties != null) setText(q("faculties"), summary.faculties);
  if (summary?.programs != null) setText(q("programs"), summary.programs);
  if (summary?.topFaculty != null) setText(q("topFaculty"), summary.topFaculty);
  if (summary?.ies != null) setText(q("ies"), summary.ies);
  if (summary?.yearRange != null) setText(q("yearRange"), summary.yearRange);
  if (summary?.avgRate != null) setText(q("avgRate"), summary.avgRate);
  if (summary?.mae != null) setText(q("mae"), summary.mae);
  if (summary?.rmse != null) setText(q("rmse"), summary.rmse);
}

async function main() {
  const summaryNodes = Array.from(
    document.querySelectorAll("[data-summary-scope][data-csv]")
  );

  for (const node of summaryNodes) {
    const scope = node.getAttribute("data-summary-scope");
    const csv = node.getAttribute("data-csv");
    const errorTarget = node.getAttribute("data-error-target");

    try {
      const summary = await loadCsvSummary(csv);
      injectSummary(scope, summary);
    } catch (err) {
      console.error(err);
      if (errorTarget) {
        const el = document.querySelector(errorTarget);
        if (el) el.textContent = "No se pudo cargar el CSV (ver consola).";
      }
    }
  }
}

main();
