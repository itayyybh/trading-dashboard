import { supabase } from "../../../lib/supabaseClient";

// stats.js and the chart/table components expect this shape (carried over
// from the original Google Sheets version): date, entry, exit, dir
// ("Long"/"Short"), asset, pnl. This is the one place that translates the
// Supabase row shape into it, so the rest of the app never has to know
// trades come from Supabase.
function toDisplayTrade(row) {
  return {
    date: row.trade_date,
    entry: row.entry_time,
    exit: row.exit_time,
    dir: row.direction === "long" ? "Long" : "Short",
    asset: row.symbol,
    pnl: Number(row.pnl),
  };
}

export async function getTrades(portfolioId) {
  const { data, error } = await supabase
    .from("trades")
    .select("trade_date, entry_time, exit_time, direction, symbol, pnl")
    .eq("portfolio_id", portfolioId)
    .order("trade_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data.map(toDisplayTrade);
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
