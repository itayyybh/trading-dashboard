import { buildIso, normalizeNumber } from "../normalizers";

// Parser for Tradovate's "Performance" CSV export (the round-trip report shown
// under the Performance tab, common with prop-firm futures traders).
//
// It is a clean single-header CSV where each row is already ONE round-trip
// trade - no fill pairing needed (unlike Interactive Brokers or Binance):
//   symbol,_priceFormat,_priceFormatType,_tickSize,buyFillId,sellFillId,qty,
//   buyPrice,sellPrice,pnl,boughtTimestamp,soldTimestamp,duration
//
// Two Tradovate-specific quirks this parser handles:
//   1. There is NO direction column. Direction is inferred from which leg came
//      first: bought-then-sold is a long, sold-then-bought is a short.
//   2. pnl is currency-formatted with accounting negatives: "$102.00" for a win,
//      "$(27.00)" for a loss. normalizeNumber() reads the parenthesized form as
//      negative, so we route pnl through it like every other numeric cell.

export const id = "tradovate";
export const label = "Tradovate";

const COL = {
  symbol: "symbol",
  qty: "qty",
  buyPrice: "buyPrice",
  sellPrice: "sellPrice",
  pnl: "pnl",
  bought: "boughtTimestamp",
  sold: "soldTimestamp",
};

// Columns unique to this export - the internal underscore-prefixed and fill-id
// columns make a strong fingerprint no other supported source shares.
const SIGNATURE = ["buyFillId", "sellFillId", "boughtTimestamp", "soldTimestamp", "pnl"];

// Header-based detection: this is a clean single-header CSV, so headers alone
// identify it (no raw-text scan needed).
export function detect(headers = []) {
  const cols = new Set(headers);
  return SIGNATURE.every((h) => cols.has(h)) ? 0.95 : 0;
}

// Tradovate timestamps are US-format "MM/DD/YYYY HH:MM:SS". We parse them
// explicitly here (rather than via normalizeDate, which reads ambiguous slash
// dates DAY-first) because we KNOW this source is month-first. Returns a
// normalized date, the clock time, and a numeric sort key for ordering the legs.
function parseUsTimestamp(value) {
  const m = String(value ?? "").trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/);
  if (!m) return null;
  const [, mm, dd, yyyy, hh, min, ss] = m;
  const date = buildIso(yyyy, mm, dd);
  if (!date) return null;
  const time = `${hh}:${min}:${ss}`;
  const sortKey = Number(`${yyyy}${mm.padStart(2, "0")}${dd.padStart(2, "0")}${hh}${min}${ss}`);
  return { date, time, sortKey };
}

export function parse(rows = []) {
  const valid = [];
  const invalid = [];
  let tradeNumber = 0;

  for (const row of rows) {
    tradeNumber += 1;

    const bought = parseUsTimestamp(row[COL.bought]);
    const sold = parseUsTimestamp(row[COL.sold]);
    const symbol = String(row[COL.symbol] ?? "").trim();
    const qty = normalizeNumber(row[COL.qty]);
    const buyPrice = normalizeNumber(row[COL.buyPrice]);
    const sellPrice = normalizeNumber(row[COL.sellPrice]);
    const pnl = normalizeNumber(row[COL.pnl]);

    const errors = [];
    if (!bought || !sold) errors.push("invalidDate");
    if (!symbol) errors.push("missingSymbol");
    if (pnl === null) errors.push("invalidPnl");
    if (errors.length) {
      invalid.push({ row: tradeNumber, errors });
      continue;
    }

    // Bought first -> entered long, later sold to close. Sold first -> entered
    // short (sold to open), later bought to close.
    const isLong = bought.sortKey <= sold.sortKey;
    const entry = isLong ? bought : sold;
    const exit = isLong ? sold : bought;

    valid.push({
      trade_date: exit.date, // key off the close, matching the TradingView parser
      direction: isLong ? "long" : "short",
      symbol,
      pnl,
      entry_time: entry.time,
      exit_time: exit.time,
      quantity: qty,
      entry_price: isLong ? buyPrice : sellPrice,
      exit_price: isLong ? sellPrice : buyPrice,
      fees: 0, // the Performance export carries no per-trade commission column
      raw_row: row,
    });
  }

  return { valid, invalid };
}

export default { id, label, detect, parse };
