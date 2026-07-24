// Shared value-normalization primitives for the import engine.
//
// Every parser (broker-specific or the generic column-mapping fallback) and the
// manual "Log Trade" form converge on these functions, so a fix here fixes date
// / direction / number handling everywhere. Keep this file free of UI, i18n, and
// broker-specific logic - it is the single normalization boundary.

const DIRECTION_SYNONYMS = {
  long: "long", buy: "long", l: "long", "לונג": "long",
  short: "short", sell: "short", s: "short", "שורט": "short",
};

// Normalizes a raw direction cell to "long" | "short", or null if unrecognized.
// Handles English buy/sell/long/short and Hebrew לונג/שורט synonyms.
export function normalizeDirection(value) {
  const key = String(value ?? "").trim().toLowerCase();
  return DIRECTION_SYNONYMS[key] ?? null;
}

// Parses a numeric cell, tolerating currency symbols and thousands separators
// (e.g. "$1,234.50"). Also reads accounting-style parenthesized negatives, where
// a value wrapped in parentheses denotes a loss - e.g. Tradovate exports losses
// as "$(27.00)", which must become -27, not 27. Returns null when the value is
// empty or non-numeric.
export function normalizeNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const str = String(value).trim();
  // Detect the wrapping parentheses BEFORE stripping them. Only $/whitespace may
  // sit outside the parens (e.g. "$(27.00)"); anything else is not this format.
  const isParenNegative = /^\(.*\)$/.test(str.replace(/[$\s]/g, ""));
  const n = parseFloat(str.replace(/[$,()]/g, "").trim());
  if (!Number.isFinite(n)) return null;
  return isParenNegative ? -Math.abs(n) : n;
}

// Builds a YYYY-MM-DD string from numeric parts. Returns null if the day/month
// are out of range. Deliberately assembles the string by hand rather than via
// Date.toISOString(), which converts to UTC and can shift the day across
// midnight for anyone not on UTC (an Israel-timezone user saw June dates land a
// day early). 2-digit years are assumed to be 2000s.
export function buildIso(year, month, day) {
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
