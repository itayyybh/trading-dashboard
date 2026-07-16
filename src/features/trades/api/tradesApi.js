import { supabase } from "../../../lib/supabaseClient";

// stats.js and the chart/table components expect this shape (carried over
// from the original Google Sheets version): date, entry, exit, dir
// ("Long"/"Short"), asset, pnl. This is the one place that translates the
// Supabase row shape into it, so the rest of the app never has to know
// trades come from Supabase.
function toDisplayTrade(row) {
  return {
    id: row.id,
    date: row.trade_date,
    entry: row.entry_time,
    exit: row.exit_time,
    dir: row.direction === "long" ? "Long" : "Short",
    asset: row.symbol,
    pnl: Number(row.pnl),
    // The editable underlying fields, kept alongside the display shape so the
    // trade log can open an edit form without a second fetch.
    raw: {
      trade_date: row.trade_date,
      direction: row.direction,
      symbol: row.symbol,
      pnl: row.pnl,
      entry_time: row.entry_time,
      exit_time: row.exit_time,
      quantity: row.quantity,
      entry_price: row.entry_price,
      exit_price: row.exit_price,
      fees: row.fees,
    },
  };
}

export async function getTrades(portfolioId) {
  const { data, error } = await supabase
    .from("trades")
    .select("id, trade_date, entry_time, exit_time, direction, symbol, pnl, quantity, entry_price, exit_price, fees")
    .eq("portfolio_id", portfolioId)
    .order("trade_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data.map(toDisplayTrade);
}

// Updates the editable fields of a single trade. `fields` is already normalized
// (see the normalize* helpers, shared with LogTradeModal). Import metadata
// (source, batch, raw_row) is intentionally left untouched.
export async function updateTrade(id, fields) {
  const { error } = await supabase.from("trades").update(fields).eq("id", id);
  if (error) throw error;
}

// `trade` is already normalized (see applyMapping.js's normalize* helpers,
// reused by LogTradeModal.jsx) - this just tags it as a manual entry and inserts.
export async function logManualTrade(portfolioId, trade) {
  const { error } = await supabase.from("trades").insert({
    ...trade,
    portfolio_id: portfolioId,
    import_batch_id: null,
    source: "manual",
    source_file: null,
  });

  if (error) throw error;
}
