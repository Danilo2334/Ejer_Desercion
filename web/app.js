/* global document, fetch, localStorage, matchMedia */

const STORAGE_KEYS = {
  theme: "du.theme",
  lang: "du.lang",
};

const SUPPORTED_LANGS = ["es", "en"];

const I18N = {
  es: {
    "nav.home": "Inicio",
    "nav.d1": "Dashboard 1",
    "nav.d2": "Dashboard 2",
    "nav.d3": "Dashboard 3",
    "nav.d4": "Dashboard 4",
    "ui.theme": "Tema",
    "ui.theme.light": "Claro",
    "ui.theme.dark": "Oscuro",
    "ui.lang": "Idioma",
    "ui.search": "Buscar...",
    "home.title": "Deserción Universitaria",
    "home.subtitle": "Portal de análisis y dashboards (Power BI)",
    "home.welcomeTitle": "Bienvenido(a)",
    "home.welcomeBody":
      "Explora métricas, tendencias y hallazgos sobre deserción académica para apoyar decisiones y acciones de bienestar estudiantil.",
    "home.quick": "Acceso rápido",
    "home.quickBody":
      "Selecciona uno de los dashboards para abrirlo en una vista con información y contexto.",
    "home.cta.dashboards": "Ver dashboards",
    "home.cta.model": "Modelo predictivo",
    "kpi.records": "Registros en el dataset",
    "kpi.periods": "Períodos",
    "kpi.topFaculty": "Facultad con más casos",
    "kpi.topProgram": "Programa con más casos",
    "kpi.updated": "Fuente",
    "kpi.updated.value": "CSV institucional",
    "section.desercion": "Deserción (Clean)",
    "section.tasas": "Tasas (Clean)",
    "section.modelo": "Modelo (Tasas)",
    "section.datasets.title": "Resumen de datasets",
    "section.datasets.subtitle": "Métricas rápidas calculadas desde tus CSV procesados.",
    "section.dashboards.subtitle": "Abre cada vista con el reporte y su contexto al lado.",
    "label.faculties": "Facultades",
    "label.programs": "Programas",
    "label.ies": "IES",
    "label.yearRange": "Rango de años",
    "label.avgRate": "Tasa promedio",
    "label.modelRecords": "Registros del modelo",
    "label.mae": "MAE (aprox.)",
    "label.rmse": "RMSE (aprox.)",
    "label.modelCsv": "Modelo CSV",
    "label.tasasCsv": "Tasas CSV",
    "cards.section": "Dashboards",
    "card.1.title": "Resumen Ejecutivo",
    "card.1.desc": "Indicadores clave y filtros principales.",
    "card.2.title": "Análisis Detallado",
    "card.2.desc": "Tendencias y comportamiento en el tiempo.",
    "card.3.title": "Análisis Estratégico",
    "card.3.desc": "Grupos afectados e insights accionables.",
    "card.4.title": "Modelo Predictivo",
    "card.4.desc": "Evaluación del modelo y métricas.",
    "dash.sidebar.title": "Información",
    "dash.sidebar.about": "Sobre este dashboard",
    "dash.sidebar.key": "Claves",
    "dash.sidebar.dataset": "Dataset",
    "dash.sidebar.dataset.body":
      "Métricas calculadas a partir del archivo CSV local del proyecto (agregadas).",
    "dash.sidebar.tips": "Sugerencias",
    "dash.sidebar.tips.body":
      "Usa los filtros del reporte para segmentar por facultad, programa, sede, género y estrato (según aplique).",
    "dash.1.title": "Dashboard 1: Resumen Ejecutivo",
    "dash.1.subtitle": "Indicadores clave y distribución general.",
    "dash.1.about":
      "Vista inicial para una lectura rápida del panorama de deserción académica y sus principales segmentaciones.",
    "dash.1.key.1": "KPI agregados del dataset y comparaciones generales.",
    "dash.1.key.2": "Distribución por facultad, programa, género y estrato (según datos).",
    "dash.2.title": "Dashboard 2: Análisis Detallado",
    "dash.2.subtitle": "Tendencias y comportamiento en el tiempo.",
    "dash.2.about":
      "Profundiza en la evolución de los casos por período y en patrones por nivel/formación y categorías.",
    "dash.2.key.1": "Evolución de la tasa/casos por año o período (según reporte).",
    "dash.2.key.2": "Segmentación por tipo, nivel de formación o categoría.",
    "dash.3.title": "Dashboard 3: Análisis Estratégico",
    "dash.3.subtitle": "Grupos más afectados e insights accionables.",
    "dash.3.about":
      "Enfocado en priorización: identifica grupos de riesgo y dónde intervenir para reducir la deserción.",
    "dash.3.key.1": "Grupos afectados por facultad, estrato, edad y género (según reporte).",
    "dash.3.key.2": "Recomendaciones estratégicas para decisiones académicas.",
    "dash.4.title": "Dashboard 4: Modelo Predictivo",
    "dash.4.subtitle": "Evaluación del modelo y análisis de predicción.",
    "dash.4.about":
      "Revisa el desempeño del modelo predictivo y la relación entre valores reales y predichos.",
    "dash.4.key.1": "Métricas de desempeño (por ejemplo MAE/R² según reporte).",
    "dash.4.key.2": "Comparación real vs predicho y análisis de errores.",
  },
  en: {
    "nav.home": "Home",
    "nav.d1": "Dashboard 1",
    "nav.d2": "Dashboard 2",
    "nav.d3": "Dashboard 3",
    "nav.d4": "Dashboard 4",
    "ui.theme": "Theme",
    "ui.theme.light": "Light",
    "ui.theme.dark": "Dark",
    "ui.lang": "Language",
    "ui.search": "Search...",
    "home.title": "University Dropout",
    "home.subtitle": "Analytics and dashboards portal (Power BI)",
    "home.welcomeTitle": "Welcome",
    "home.welcomeBody":
      "Explore metrics, trends and insights about academic dropout to support decisions and student well-being actions.",
    "home.quick": "Quick access",
    "home.quickBody":
      "Pick a dashboard to open a dedicated view with context and key information.",
    "home.cta.dashboards": "View dashboards",
    "home.cta.model": "Predictive model",
    "kpi.records": "Dataset records",
    "kpi.periods": "Periods",
    "kpi.topFaculty": "Top faculty (cases)",
    "kpi.topProgram": "Top program (cases)",
    "kpi.updated": "Source",
    "kpi.updated.value": "Institutional CSV",
    "section.desercion": "Dropout (Clean)",
    "section.tasas": "Rates (Clean)",
    "section.modelo": "Model (Rates)",
    "section.datasets.title": "Datasets summary",
    "section.datasets.subtitle": "Quick metrics computed from your processed CSVs.",
    "section.dashboards.subtitle": "Open each view with the report and its context side-by-side.",
    "label.faculties": "Faculties",
    "label.programs": "Programs",
    "label.ies": "Institutions",
    "label.yearRange": "Year range",
    "label.avgRate": "Average rate",
    "label.modelRecords": "Model records",
    "label.mae": "MAE (approx.)",
    "label.rmse": "RMSE (approx.)",
    "label.modelCsv": "Model CSV",
    "label.tasasCsv": "Rates CSV",
    "cards.section": "Dashboards",
    "card.1.title": "Executive Summary",
    "card.1.desc": "Key indicators and main filters.",
    "card.2.title": "Detailed Analysis",
    "card.2.desc": "Trends and behavior over time.",
    "card.3.title": "Strategic Analysis",
    "card.3.desc": "Affected groups and actionable insights.",
    "card.4.title": "Predictive Model",
    "card.4.desc": "Model evaluation and metrics.",
    "dash.sidebar.title": "Info",
    "dash.sidebar.about": "About this dashboard",
    "dash.sidebar.key": "Key points",
    "dash.sidebar.dataset": "Dataset",
    "dash.sidebar.dataset.body":
      "Metrics calculated from the project local CSV file (aggregated).",
    "dash.sidebar.tips": "Tips",
    "dash.sidebar.tips.body":
      "Use report filters to segment by faculty, program, campus, gender and socioeconomic level (when available).",
    "dash.1.title": "Dashboard 1: Executive Summary",
    "dash.1.subtitle": "Key indicators and overall distribution.",
    "dash.1.about":
      "Landing view for a quick read of the academic dropout landscape and its main segmentations.",
    "dash.1.key.1": "Aggregated KPIs and overall comparisons.",
    "dash.1.key.2": "Distribution by faculty, program, gender and socioeconomic level (as available).",
    "dash.2.title": "Dashboard 2: Detailed Analysis",
    "dash.2.subtitle": "Trends and behavior over time.",
    "dash.2.about":
      "Dive into the evolution of cases by period and patterns by level/training and categories.",
    "dash.2.key.1": "Trend of rate/cases by year or period (as shown in the report).",
    "dash.2.key.2": "Segmentation by type, education level or category.",
    "dash.3.title": "Dashboard 3: Strategic Analysis",
    "dash.3.subtitle": "Most affected groups and actionable insights.",
    "dash.3.about":
      "Prioritization-focused: identify risk groups and where to intervene to reduce dropout.",
    "dash.3.key.1": "Affected groups by faculty, socioeconomic level, age and gender (as shown).",
    "dash.3.key.2": "Strategic recommendations for academic decisions.",
    "dash.4.title": "Dashboard 4: Predictive Model",
    "dash.4.subtitle": "Model evaluation and prediction analysis.",
    "dash.4.about":
      "Review predictive model performance and the relationship between actual and predicted values.",
    "dash.4.key.1": "Performance metrics (e.g., MAE/R² as in the report).",
    "dash.4.key.2": "Actual vs predicted comparison and error analysis.",
  },
};

function getPreferredTheme() {
  const stored = localStorage.getItem(STORAGE_KEYS.theme);
  if (stored === "light" || stored === "dark") return stored;
  return matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(STORAGE_KEYS.theme, theme);
  const toggle = document.querySelector("[data-theme-toggle]");
  if (toggle) {
    toggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    toggle.textContent =
      theme === "dark" ? translate("ui.theme.dark") : translate("ui.theme.light");
  }
}

function getPreferredLang() {
  const stored = localStorage.getItem(STORAGE_KEYS.lang);
  if (SUPPORTED_LANGS.includes(stored)) return stored;
  const browser = (navigator.language || "es").slice(0, 2).toLowerCase();
  return SUPPORTED_LANGS.includes(browser) ? browser : "es";
}

function setLang(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) return;
  document.documentElement.lang = lang;
  localStorage.setItem(STORAGE_KEYS.lang, lang);
  applyTranslations();
  const select = document.querySelector("[data-lang-select]");
  if (select) select.value = lang;
  const toggle = document.querySelector("[data-theme-toggle]");
  if (toggle) setTheme(document.documentElement.dataset.theme || getPreferredTheme());
}

function translate(key) {
  const lang = document.documentElement.lang || "es";
  return I18N[lang]?.[key] ?? I18N.es[key] ?? key;
}

function applyTranslations() {
  const lang = document.documentElement.lang || "es";
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const value = I18N[lang]?.[key] ?? I18N.es[key];
    if (value == null) return;
    el.textContent = value;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    const value = I18N[lang]?.[key] ?? I18N.es[key];
    if (value == null) return;
    el.setAttribute("placeholder", value);
  });
}

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

function pickTop(counter) {
  let bestKey = null;
  let bestValue = -1;
  for (const [key, value] of counter.entries()) {
    if (value > bestValue) {
      bestKey = key;
      bestValue = value;
    }
  }
  if (!bestKey) return null;
  return { key: bestKey, value: bestValue };
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

function summaryDesercionClean(headers, rows) {
  const iFacultad = findHeaderIndex(headers, ["NOMBRE_FACULTAD"]);
  const iPrograma = findHeaderIndex(headers, ["NOMBRE_PROGRAMA"]);
  const iGenero = findHeaderIndex(headers, ["GENERO"]);

  const facultySet = new Set();
  const programSet = new Set();
  const genderCounter = new Map();
  const facultyCounter = new Map();
  const programCounter = new Map();

  for (const row of rows) {
    const facultad = iFacultad >= 0 ? normalize(row[iFacultad]) : "";
    const programa = iPrograma >= 0 ? normalize(row[iPrograma]) : "";
    const genero = iGenero >= 0 ? normalize(row[iGenero]) : "";

    if (facultad) {
      facultySet.add(facultad);
      facultyCounter.set(facultad, (facultyCounter.get(facultad) || 0) + 1);
    }
    if (programa) {
      programSet.add(programa);
      programCounter.set(programa, (programCounter.get(programa) || 0) + 1);
    }
    if (genero) {
      genderCounter.set(genero, (genderCounter.get(genero) || 0) + 1);
    }
  }

  return {
    records: rows.length,
    faculties: facultySet.size,
    programs: programSet.size,
    topFaculty: pickTop(facultyCounter),
    topProgram: pickTop(programCounter),
    topGender: pickTop(genderCounter),
  };
}

function summaryTasasClean(headers, rows) {
  const iIes = findHeaderIndex(headers, ["IES", "ies"]);
  const iAno = findHeaderIndex(headers, ["Año", "AÃ±o", "ano", "ANO"]);
  const iTasa = findHeaderIndex(headers, ["Tasa", "tasa"]);
  const iTipo = findHeaderIndex(headers, ["Tipo", "tipo"]);

  const iesSet = new Set();
  const tipoSet = new Set();
  let minYear = null;
  let maxYear = null;
  let sumRate = 0;
  let countRate = 0;

  for (const row of rows) {
    const ies = iIes >= 0 ? normalize(row[iIes]) : "";
    const tipo = iTipo >= 0 ? normalize(row[iTipo]) : "";
    const year = iAno >= 0 ? toNumber(row[iAno]) : null;
    const rate = iTasa >= 0 ? toNumber(row[iTasa]) : null;

    if (ies) iesSet.add(ies);
    if (tipo) tipoSet.add(tipo);
    if (year != null) {
      minYear = minYear == null ? year : Math.min(minYear, year);
      maxYear = maxYear == null ? year : Math.max(maxYear, year);
    }
    if (rate != null) {
      sumRate += rate;
      countRate += 1;
    }
  }

  return {
    records: rows.length,
    ies: iesSet.size,
    types: tipoSet.size,
    yearRange: minYear != null && maxYear != null ? `${minYear}–${maxYear}` : null,
    avgRate: countRate > 0 ? sumRate / countRate : null,
  };
}

function summaryModeloTasas(headers, rows) {
  const iAno = findHeaderIndex(headers, ["ano", "Año", "AÃ±o"]);
  const iActual = findHeaderIndex(headers, ["tasa", "Tasa"]);
  const iPred = findHeaderIndex(headers, ["tasa_predicha", "tasa_predicha "]);
  const iIes = findHeaderIndex(headers, ["ies", "IES"]);

  let minYear = null;
  let maxYear = null;
  const iesSet = new Set();

  let sumAbsErr = 0;
  let sumSqErr = 0;
  let count = 0;

  for (const row of rows) {
    const year = iAno >= 0 ? toNumber(row[iAno]) : null;
    const actual = iActual >= 0 ? toNumber(row[iActual]) : null;
    const pred = iPred >= 0 ? toNumber(row[iPred]) : null;
    const ies = iIes >= 0 ? normalize(row[iIes]) : "";

    if (ies) iesSet.add(ies);
    if (year != null) {
      minYear = minYear == null ? year : Math.min(minYear, year);
      maxYear = maxYear == null ? year : Math.max(maxYear, year);
    }
    if (actual != null && pred != null) {
      const err = actual - pred;
      sumAbsErr += Math.abs(err);
      sumSqErr += err * err;
      count += 1;
    }
  }

  const mae = count > 0 ? sumAbsErr / count : null;
  const rmse = count > 0 ? Math.sqrt(sumSqErr / count) : null;

  return {
    records: rows.length,
    ies: iesSet.size,
    yearRange: minYear != null && maxYear != null ? `${minYear}–${maxYear}` : null,
    mae,
    rmse,
  };
}

async function loadCsvSummary(csvPath) {
  const response = await fetch(csvPath, { cache: "no-store" });
  if (!response.ok) throw new Error(`No se pudo cargar CSV (${response.status})`);
  const text = stripBom(await response.text());
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) throw new Error("CSV vacío o inválido");

  const headers = parseCsvLine(lines[0]).map((h) => normalize(h).replace(/^"|"$/g, ""));
  const rows = [];
  for (let li = 1; li < lines.length; li += 1) rows.push(parseCsvLine(lines[li]));

  const headerKey = headers.map((h) => h.toLowerCase()).join("|");
  let summary = null;

  if (headerKey.includes("tipo_desercion") || headerKey.includes("nombre_facultad")) {
    summary = summaryDesercionClean(headers, rows);
    summary.dataset = "desercion_clean";
  } else if (headerKey.includes("tasa_predicha")) {
    summary = summaryModeloTasas(headers, rows);
    summary.dataset = "modelo_tasas";
  } else if (headerKey.includes("tasa") && (headerKey.includes("ies") || headerKey.includes("aÃ±o") || headerKey.includes("año") || headerKey.includes("ano"))) {
    summary = summaryTasasClean(headers, rows);
    summary.dataset = "tasas_clean";
  } else {
    summary = { records: rows.length, dataset: "csv" };
  }

  summary.csvPath = csvPath;
  return summary;
}

function formatNumber(value) {
  try {
    return new Intl.NumberFormat(document.documentElement.lang || "es").format(value);
  } catch {
    return String(value);
  }
}

function formatFloat(value, digits = 2) {
  if (value == null) return "—";
  try {
    return new Intl.NumberFormat(document.documentElement.lang || "es", {
      maximumFractionDigits: digits,
      minimumFractionDigits: digits,
    }).format(value);
  } catch {
    return String(value.toFixed(digits));
  }
}

function injectSummary(scope, summary) {
  const setText = (selector, value) => {
    const el = document.querySelector(selector);
    if (!el) return;
    el.textContent = value;
  };

  const q = (k) => `[data-kpi='${scope}.${k}']`;
  if (summary?.records != null) setText(q("records"), formatNumber(summary.records));
  if (summary?.periods != null) setText(q("periods"), formatNumber(summary.periods));
  if (summary?.faculties != null) setText(q("faculties"), formatNumber(summary.faculties));
  if (summary?.programs != null) setText(q("programs"), formatNumber(summary.programs));
  if (summary?.ies != null) setText(q("ies"), formatNumber(summary.ies));
  if (summary?.types != null) setText(q("types"), formatNumber(summary.types));
  if (summary?.yearRange != null) setText(q("yearRange"), summary.yearRange);
  if (summary?.avgRate != null) setText(q("avgRate"), formatFloat(summary.avgRate));
  if (summary?.mae != null) setText(q("mae"), formatFloat(summary.mae));
  if (summary?.rmse != null) setText(q("rmse"), formatFloat(summary.rmse));

  if (summary?.topFaculty?.key) setText(q("topFaculty"), summary.topFaculty.key);
  if (summary?.topProgram?.key) setText(q("topProgram"), summary.topProgram.key);

  document.querySelectorAll(`[data-csv-path='${scope}']`).forEach((el) => {
    if (summary?.csvPath) el.textContent = summary.csvPath;
  });
}

function setupUi() {
  const themeBtn = document.querySelector("[data-theme-toggle]");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const current = document.documentElement.dataset.theme || getPreferredTheme();
      const next = current === "dark" ? "light" : "dark";
      setTheme(next);
    });
  }

  const langSelect = document.querySelector("[data-lang-select]");
  if (langSelect) {
    langSelect.addEventListener("change", (e) => setLang(e.target.value));
  }

  const searchInput = document.querySelector("[data-card-search]");
  if (searchInput) {
    const cards = Array.from(document.querySelectorAll("[data-card]"));
    const normalizeText = (t) => String(t || "").toLowerCase().trim();
    const apply = () => {
      const q = normalizeText(searchInput.value);
      for (const card of cards) {
        const hay = normalizeText(card.textContent);
        const visible = q.length === 0 || hay.includes(q);
        card.style.display = visible ? "" : "none";
      }
    };
    searchInput.addEventListener("input", apply);
  }
}

async function main() {
  const initialLang = getPreferredLang();
  document.documentElement.lang = initialLang;
  applyTranslations();
  setTheme(getPreferredTheme());
  setupUi();

  const wantsSummary = document.querySelector("[data-load-summary]");
  if (wantsSummary) {
    const summaryNodes = Array.from(document.querySelectorAll("[data-summary-scope][data-csv]"));
    if (summaryNodes.length === 0) return;

    for (const node of summaryNodes) {
      const scope = node.getAttribute("data-summary-scope");
      const csv = node.getAttribute("data-csv");
      const errSel = node.getAttribute("data-error-target");
      const errEl = errSel ? document.querySelector(errSel) : null;
      try {
        const summary = await loadCsvSummary(csv);
        injectSummary(scope, summary);
      } catch (err) {
        if (errEl) errEl.textContent = String(err?.message || err);
      }
    }
  }
}

main();
