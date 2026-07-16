import Papa from "papaparse";
import { normalizeDate, normalizeDirection, normalizeNumber } from "../normalizers";

// Parser for the Interactive Brokers "Default Activity Statement" CSV export.
//
// That file is a multi-section CSV: every row's FIRST column is the section name
// ("Statement", "Account Information", "Trades", "Open Positions", ...) and the
// SECOND is a row type ("Header" | "Data" | "SubTotal" | "Total"). Because the
// sections don't share one header row, PapaParse's header mode is useless here -
// so we detect and parse off the raw file text and pull out just the Trades
// section ourselves.
//
// The Trades header is:
//   Trades,Header,DataDiscriminator,Asset Category,Currency,Symbol,Date/Time,
//   Quantity,T. Price,C. Price,Proceeds,Comm/Fee,Basis,Realized P/L,MTM P/L,Code

export const id = "interactive_brokers";
export const label = "Interactive Brokers";

const TRADES_SECTION_MARKER = "Trades,Header,DataDiscriminator";

// Confidence this file is an IB statement. Header-based detection is unreliable
// (see above), so we look at the raw text: the Trades section signature is the
// strong signal; the "Interactive Brokers" broker-name line confirms it.
export function detect(headers, sampleRows, rawText = "") {
  if (!rawText) return 0;
  const hasTradesSection = rawText.includes(TRADES_SECTION_MARKER);
  const namedIb = /Interactive Brokers/i.test(rawText);
  if (hasTradesSection && namedIb) return 0.98;
  if (hasTradesSection) return 0.8; // trades section present but broker line renamed/absent
  return 0;
}

// IB has no buy/sell column - direction is the sign of Quantity: a positive
// quantity is a buy, a negative one a sell. normalizeDirection then maps those
// to DASH's long/short.
function sideFromQuantity(qty) {
  if (qty === null) return null;
  return qty >= 0 ? "buy" : "sell";
}

// MVP modeling choice (documented deliberately): IB's Trades section lists one
// row per EXECUTION, not per round-trip. We import each execution faithfully -
// direction from the fill's sign, pnl from that row's Realized P/L (which is 0
// for position-opening fills). Pairing opens with closes into single round-trip
// trades is a known follow-up, best validated against a real user statement.
export function parse(rows, rawText = "") {
  const valid = [];
  const invalid = [];
  if (!rawText) return { valid, invalid };

  const lines = Papa.parse(rawText, { skipEmptyLines: true }).data; // string[][]

  const header = lines.find((r) => r[0] === "Trades" && r[1] === "Header");
  if (!header) return { valid, invalid };

  const colIndex = {};
  header.forEach((name, i) => { colIndex[name] = i; });
  const at = (row, name) => (colIndex[name] != null ? row[colIndex[name]] : undefined);

  let dataRowNumber = 0;
  for (const row of lines) {
    if (row[0] !== "Trades" || row[1] !== "Data") continue; // skips SubTotal/Total rows too
    const discriminator = at(row, "DataDiscriminator");
    // Only real executions - skip ClosedLot/summary discriminators.
    if (discriminator !== "Order" && discriminator !== "Trade") continue;
    dataRowNumber += 1;

    const quantity = normalizeNumber(at(row, "Quantity"));
    // Date/Time looks like "2026-01-05, 10:31:00" (quoted, so the comma is safe
    // through PapaParse); keep only the date, which is already year-first ISO.
    const trade_date = normalizeDate(String(at(row, "Date/Time") ?? "").split(",")[0]);
    const direction = normalizeDirection(sideFromQuantity(quantity));
    const symbol = String(at(row, "Symbol") ?? "").trim();
    const pnl = normalizeNumber(at(row, "Realized P/L"));
    const price = normalizeNumber(at(row, "T. Price"));

    const errors = [];
    if (!trade_date) errors.push("invalidDate");
    if (!direction) errors.push("unrecognizedDirection");
    if (!symbol) errors.push("missingSymbol");
    if (pnl === null) errors.push("invalidPnl");
    if (errors.length) {
      invalid.push({ row: dataRowNumber, errors });
      continue;
    }

    valid.push({
      trade_date,
      direction,
      symbol,
      pnl,
      entry_time: null,
      exit_time: null,
      quantity: quantity === null ? null : Math.abs(quantity),
      entry_price: direction === "long" ? price : null,
      exit_price: direction === "short" ? price : null,
      fees: normalizeNumber(at(row, "Comm/Fee")) ?? 0,
      raw_row: row,
    });
  }

  return { valid, invalid };
}

export default { id, label, detect, parse };
