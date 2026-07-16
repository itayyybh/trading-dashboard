import { normalizeDate, normalizeDirection, normalizeNumber } from "../normalizers";

// Parser for TradingView's Paper Trading "balance history" CSV export.
//
// Of the several TradingView exports, this is the ONE that carries realized P&L
// per closed position (the order-history export has fills but no P&L). It's a
// plain header CSV:
//   Time, Balance before, Balance after, Realized PnL (value),
//   Realized PnL (currency), Action
// The rows that are trades have an Action like:
//   "Close long position for symbol CME_MINI:MNQ1! at price 30571.25 for 1
//    units. Position AVG Price was 30507.750000, currency: USD, ..."
// Everything we need comes from that Action string plus the Realized PnL column,
// so each closed-position row becomes exactly one round-trip trade - no fill
// pairing required (unlike Interactive Brokers).

export const id = "tradingview";
export const label = "TradingView";

const COL = { time: "Time", pnl: "Realized PnL (value)", action: "Action" };

// Columns unique to this export - used as the detection fingerprint.
const SIGNATURE = ["Balance before", "Balance after", "Realized PnL (value)", "Action"];

// Header-based detection: this is a clean single-header CSV, so headers alone
// identify it (no raw-text scan needed).
export function detect(headers = []) {
  const cols = new Set(headers);
  return SIGNATURE.every((h) => cols.has(h)) ? 0.95 : 0;
}

const CLOSE_RE = /^Close (long|short) position for symbol (\S+) at price ([\d.]+) for (\d+) units\. Position AVG Price was ([\d.]+)/;

// "CME_MINI:MNQ1!" -> "MNQ1!" (drop the exchange prefix for a readable symbol).
function shortSymbol(raw) {
  const s = String(raw ?? "").trim();
  const colon = s.lastIndexOf(":");
  return colon >= 0 ? s.slice(colon + 1) : s;
}

export function parse(rows = []) {
  const valid = [];
  const invalid = [];
  let tradeNumber = 0;

  for (const row of rows) {
    const match = String(row[COL.action] ?? "").match(CLOSE_RE);
    if (!match) continue; // non-trade balance rows (deposits, adjustments, ...) are skipped
    tradeNumber += 1;

    const direction = normalizeDirection(match[1]);
    const symbol = shortSymbol(match[2]);
    const exit_price = normalizeNumber(match[3]);
    const quantity = normalizeNumber(match[4]);
    const entry_price = normalizeNumber(match[5]); // "Position AVG Price"
    const pnl = normalizeNumber(row[COL.pnl]);

    // "2026-07-16 16:46:15" -> date + close time.
    const [datePart, timePart] = String(row[COL.time] ?? "").trim().split(/\s+/);
    const trade_date = normalizeDate(datePart);

    const errors = [];
    if (!trade_date) errors.push("invalidDate");
    if (!direction) errors.push("unrecognizedDirection");
    if (!symbol) errors.push("missingSymbol");
    if (pnl === null) errors.push("invalidPnl");
    if (errors.length) {
      invalid.push({ row: tradeNumber, errors });
      continue;
    }

    valid.push({
      trade_date,
      direction,
      symbol,
      pnl,
      entry_time: null,
      exit_time: timePart || null,
      quantity,
      entry_price,
      exit_price,
      fees: 0,
      raw_row: row,
    });
  }

  return { valid, invalid };
}

export default { id, label, detect, parse };
