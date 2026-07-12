// labelKey looks up the display text in translations.js (translated at
// render time in ImportFlow.jsx) - kept as a key here so this file stays
// locale-agnostic.
export const UNIFIED_FIELDS = [
  { key: "trade_date", labelKey: "date", required: true },
  { key: "direction", labelKey: "directionField", required: true },
  { key: "symbol", labelKey: "symbolField", required: true },
  { key: "pnl", labelKey: "pnl", required: true },
  { key: "entry_time", labelKey: "entryTimeField", required: false },
  { key: "exit_time", labelKey: "exitTimeField", required: false },
  { key: "quantity", labelKey: "quantityField", required: false },
  { key: "entry_price", labelKey: "entryPriceField", required: false },
  { key: "exit_price", labelKey: "exitPriceField", required: false },
  { key: "fees", labelKey: "feesField", required: false },
];

const DIRECTION_SYNONYMS = {
  long: "long", buy: "long", l: "long", "לונג": "long",
  short: "short", sell: "short", s: "short", "שורט": "short",
};

// Header names brokers commonly use for each unified field, for auto-guessing
// a starting mapping. Users can still override any guess in the dropdowns.
const FIELD_HEADER_SYNONYMS = {
  trade_date: ["trade date", "date", "open date", "entry date", "transaction date"],
  direction: ["side", "direction", "b/s", "buy/sell", "action", "type"],
  symbol: ["symbol", "ticker", "instrument", "asset", "contract"],
  pnl: ["net p&l", "p&l", "pnl", "profit", "realized p&l", "net profit", "net pnl"],
  entry_time: ["open time", "entry time", "time in", "start time"],
  exit_time: ["close time", "exit time", "time out", "end time"],
  quantity: ["qty", "quantity", "size", "shares", "contracts"],
  entry_price: ["fill price in", "entry price", "buy price", "open price"],
  exit_price: ["fill price out", "exit price", "sell price", "close price"],
  fees: ["commission", "commissions", "fees", "fee"],
};

function normalizeHeader(value) {
  return String(value).toLowerCase().replace(/[_-]/g, " ").replace(/\s+/g, " ").trim();
}

// Guesses a starting { unifiedFieldKey: sourceCsvHeader } mapping from header
// names alone (no saved template needed). Exact synonym match first, then a
// substring fallback for near-misses like "Net PnL ($)".
export function guessMapping(headers) {
  const mapping = {};
  const candidates = headers.map((h) => ({ original: h, normalized: normalizeHeader(h) }));
  const usedHeaders = new Set();

  for (const [field, synonyms] of Object.entries(FIELD_HEADER_SYNONYMS)) {
    let match = candidates.find((c) => !usedHeaders.has(c.original) && synonyms.includes(c.normalized));

    if (!match) {
      match = candidates.find(
        (c) => !usedHeaders.has(c.original) && synonyms.some((syn) => c.normalized.includes(syn))
      );
    }

    if (match) {
      mapping[field] = match.original;
      usedHeaders.add(match.original);
    }
  }

  return mapping;
}

// Exported for reuse by the manual "Log Trade" form (LogTradeModal.jsx),
// which needs the same normalization rules as a CSV row without going
// through a column mapping.
export function normalizeDirection(value) {
  const key = String(value ?? "").trim().toLowerCase();
  return DIRECTION_SYNONYMS[key] ?? null;
}

export function normalizeNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = parseFloat(String(value).replace(/[$,]/g, "").trim());
  return Number.isFinite(n) ? n : null;
}

// Builds a YYYY-MM-DD string from numeric parts. Returns null if the day/month
// are out of range. Deliberately assembles the string by hand rather than via
// Date.toISOString(), which converts to UTC and can shift the day across
// midnight for anyone not on UTC (an Israel-timezone user saw June dates land a
// day early). 2-digit years are assumed to be 2000s.
function buildIso(year, month, day) {
  const y = Number(year);
  const mo = Number(month);
  const d = Number(day);
  if (!Number.isInteger(y) || !Number.isInteger(mo) || !Number.isInteger(d)) return null;
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const fullYear = y < 100 ? 2000 + y : y;
  return `${String(fullYear).padStart(4, "0")}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

// Normalizes a raw date cell to YYYY-MM-DD. Ambiguous slash/dash/dot dates are
// read DAY-FIRST (European DD/MM/YYYY) - e.g. "08/06/2026" is 8 June, not 6 Aug.
// We avoid new Date() for these because the JS engine guesses American MM/DD.
export function normalizeDate(value) {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  if (!str) return null;

  // Year-first (ISO-style): YYYY-MM-DD / YYYY/MM/DD - unambiguous, month before day.
  // Also matches when a time component trails the date; we keep only the date.
  let m = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (m) return buildIso(m[1], m[2], m[3]);

  // Day-first: DD/MM/YYYY, DD-MM-YY, DD.MM.YYYY, etc.
  m = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/);
  if (m) return buildIso(m[3], m[2], m[1]);

  // Fallback for text formats (e.g. "Jun 8 2026"). Read via local getters, not
  // toISOString(), to avoid the UTC day-shift described in buildIso().
  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return null;
  return buildIso(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

// Maps one raw CSV row into the unified trade shape, or returns the reasons
// it was rejected. `mapping` is { unifiedFieldKey: sourceCsvHeader }.
export function mapRow(row, mapping) {
  const get = (field) => (mapping[field] ? row[mapping[field]] : undefined);

  const trade_date = normalizeDate(get("trade_date"));
  const direction = normalizeDirection(get("direction"));
  const symbol = String(get("symbol") ?? "").trim();
  const pnl = normalizeNumber(get("pnl"));

  // Codes, not display text - translated at render time (this file stays locale-agnostic).
  const errors = [];
  if (!trade_date) errors.push("invalidDate");
  if (!direction) errors.push("unrecognizedDirection");
  if (!symbol) errors.push("missingSymbol");
  if (pnl === null) errors.push("invalidPnl");

  if (errors.length) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    trade: {
      trade_date,
      direction,
      symbol,
      pnl,
      entry_time: get("entry_time") || null,
      exit_time: get("exit_time") || null,
      quantity: normalizeNumber(get("quantity")),
      entry_price: normalizeNumber(get("entry_price")),
      exit_price: normalizeNumber(get("exit_price")),
      fees: normalizeNumber(get("fees")) ?? 0,
      raw_row: row,
    },
  };
}

export function applyMapping(rows, mapping) {
  const valid = [];
  const invalid = [];

  rows.forEach((row, index) => {
    const result = mapRow(row, mapping);
    if (result.ok) {
      valid.push(result.trade);
    } else {
      invalid.push({ row: index + 1, errors: result.errors });
    }
  });

  return { valid, invalid };
}
