export const UNIFIED_FIELDS = [
  { key: "trade_date", label: "Date", required: true },
  { key: "direction", label: "Direction", required: true },
  { key: "symbol", label: "Symbol", required: true },
  { key: "pnl", label: "P&L", required: true },
  { key: "entry_time", label: "Entry time", required: false },
  { key: "exit_time", label: "Exit time", required: false },
  { key: "quantity", label: "Quantity", required: false },
  { key: "entry_price", label: "Entry price", required: false },
  { key: "exit_price", label: "Exit price", required: false },
  { key: "fees", label: "Fees", required: false },
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

function normalizeDirection(value) {
  const key = String(value ?? "").trim().toLowerCase();
  return DIRECTION_SYNONYMS[key] ?? null;
}

function normalizeNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = parseFloat(String(value).replace(/[$,]/g, "").trim());
  return Number.isFinite(n) ? n : null;
}

function normalizeDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

// Maps one raw CSV row into the unified trade shape, or returns the reasons
// it was rejected. `mapping` is { unifiedFieldKey: sourceCsvHeader }.
export function mapRow(row, mapping) {
  const get = (field) => (mapping[field] ? row[mapping[field]] : undefined);

  const trade_date = normalizeDate(get("trade_date"));
  const direction = normalizeDirection(get("direction"));
  const symbol = String(get("symbol") ?? "").trim();
  const pnl = normalizeNumber(get("pnl"));

  const errors = [];
  if (!trade_date) errors.push("invalid date");
  if (!direction) errors.push("unrecognized direction");
  if (!symbol) errors.push("missing symbol");
  if (pnl === null) errors.push("invalid P&L");

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
