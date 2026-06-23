import Papa from "papaparse";

const SHEET1 =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQCqVbX-R98Ce0jqR4MEzfQtomnneD0wm291IMthUwj2DPaVFEU84EZrL_xqp-UUA/pub?gid=1122126851&single=true&output=csv"
const SHEET2 =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQCqVbX-R98Ce0jqR4MEzfQtomnneD0wm291IMthUwj2DPaVFEU84EZrL_xqp-UUA/pub?gid=1587944028&single=true&output=csv";

function mapDirection(value) {
  const v = String(value || "").trim().toLowerCase();

  if (v === "לונג" || v === "long") return "Long";
  if (v === "שורט" || v === "short") return "Short";

  return value;
}

function parsePnl(value) {
  return parseFloat(
    String(value || "")
      .replace(/\$/g, "")
      .replace(/,/g, "")
      .trim()
  ) || 0;
}

function mapTrade(row) {
  return {
    date: row.date,
    entry: row.entry_time,
    exit: row.exit_time,
    dir: mapDirection(row.direction),
    asset: row.symbol,
    pnl: parsePnl(row.pnl),
  };
}

async function loadSheet(url) {
  const response = await fetch(url);
  const csv = await response.text();

  const result = Papa.parse(csv, {
    header: true,
    skipEmptyLines: true,
  });

  return result.data.map(mapTrade);
}

export async function loadTrades() {
  const portfolio1 = await loadSheet(SHEET1);
  const portfolio2 = await loadSheet(SHEET2);

  return {
    portfolio1,
    portfolio2,
  };
}