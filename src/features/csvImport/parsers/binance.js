import { normalizeDate, normalizeNumber } from "../normalizers";

// Parser for Binance's Futures "Trade History" CSV export - the variant that
// carries realized P&L (the spot trade-history export has fills but no P&L, so
// it can't become a round-trip trade). It is a plain header CSV:
//   Date(UTC),Symbol,Side,Price,Quantity,Amount,Fee,Realized Profit
//
// Structural facts this parser relies on:
//   1. One row per FILL, not per trade. A position-opening fill has
//      "Realized Profit" == 0; the fill that CLOSES it carries the realized P&L.
//      So each closing fill (Realized Profit != 0) becomes one round-trip trade.
//   2. The closing fill's Side is the EXIT side, so the trade's direction is the
//      opposite: closing SELL means the position was long; closing BUY, short.
//   3. The closing fill has the exit price and P&L but NOT the entry price - that
//      lives on the earlier opening fill(s). We recover it by pairing fills per
//      symbol FIFO, quantity-weighting the entry price and summing entry fees.

export const id = "binance";
export const label = "Binance Futures";

const COL = {
  date: "Date(UTC)",
  symbol: "Symbol",
  side: "Side",
  price: "Price",
  quantity: "Quantity",
  fee: "Fee",
  realized: "Realized Profit",
};

const SIGNATURE = ["Date(UTC)", "Symbol", "Side", "Realized Profit"];

export function detect(headers = []) {
  const cols = new Set(headers);
  return SIGNATURE.every((h) => cols.has(h)) ? 0.95 : 0;
}

// "2026-07-20 09:15:32" -> { date: "2026-07-20", time: "09:15:32" }.
function splitDateTime(value) {
  const [datePart, timePart] = String(value ?? "").trim().split(/\s+/);
  return { date: normalizeDate(datePart), time: timePart || null };
}

export function parse(rows = []) {
  const valid = [];
  const invalid = [];
  let tradeNumber = 0;

  // Per-symbol FIFO queue of open lots, each { qty, price, fee, time }. Opening
  // fills push lots; closing fills consume them to recover the entry price.
  const openLots = {};

  for (const row of rows) {
    const symbol = String(row[COL.symbol] ?? "").trim();
    const side = String(row[COL.side] ?? "").trim().toUpperCase();
    const price = normalizeNumber(row[COL.price]);
    const qty = normalizeNumber(row[COL.quantity]);
    const fee = normalizeNumber(row[COL.fee]) ?? 0;
    const realized = normalizeNumber(row[COL.realized]);
    const { date, time } = splitDateTime(row[COL.date]);

    // Opening fill (no realized P&L): queue it as a lot and move on - it is not
    // a trade on its own. A breakeven close (realized exactly 0) is treated as an
    // open here; that edge is acceptable given the file gives us no other signal.
    if (realized === null || realized === 0) {
      if (symbol && price !== null && qty !== null) {
        (openLots[symbol] ||= []).push({ qty: Math.abs(qty), price, fee, time });
      }
      continue;
    }

    // Closing fill -> one round-trip trade.
    tradeNumber += 1;

    // Consume matching open lots FIFO to recover a quantity-weighted entry price
    // and the entry-side fees/time. Missing opens (partial history) just leave
    // entry_price null - we never drop a trade that has realized P&L.
    let remaining = qty === null ? 0 : Math.abs(qty);
    const queue = openLots[symbol] ||= [];
    let entryValue = 0;
    let entryQty = 0;
    let entryFee = 0;
    let entryTime = null;
    while (remaining > 0 && queue.length) {
      const lot = queue[0];
      const take = Math.min(remaining, lot.qty);
      const takeFee = lot.qty > 0 ? lot.fee * (take / lot.qty) : 0;
      entryValue += lot.price * take;
      entryQty += take;
      entryFee += takeFee;
      if (entryTime === null) entryTime = lot.time;
      lot.qty -= take;
      lot.fee -= takeFee;
      remaining -= take;
      if (lot.qty <= 0) queue.shift();
    }

    const direction = side === "SELL" ? "long" : "short"; // exit side is inverse
    const entry_price = entryQty > 0 ? entryValue / entryQty : null;

    const errors = [];
    if (!date) errors.push("invalidDate");
    if (!symbol) errors.push("missingSymbol");
    if (realized === null) errors.push("invalidPnl");
    if (errors.length) {
      invalid.push({ row: tradeNumber, errors });
      continue;
    }

    valid.push({
      trade_date: date,
      direction,
      symbol,
      pnl: realized,
      entry_time: entryTime,
      exit_time: time,
      quantity: qty === null ? null : Math.abs(qty),
      entry_price,
      exit_price: price,
      fees: entryFee + fee,
      raw_row: row,
    });
  }

  return { valid, invalid };
}

export default { id, label, detect, parse };
