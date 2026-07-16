// The contract every broker/platform parser implements. This file is pure
// documentation + validation - it has no runtime behavior of its own. Adding a
// new source (Interactive Brokers, TradingView, Binance, ...) means creating
// ONE module that exports an object of this shape and registering it in
// parserRegistry.js. Nothing else in the engine or UI needs to change.

/**
 * @typedef {Object} ParsedImport
 * @property {Object[]} valid
 *   Normalized Trade objects - the SAME shape applyMapping() produces, so the
 *   rest of the pipeline (importApi -> trades table -> dashboard) is identical
 *   regardless of which parser produced them.
 * @property {{ row: number, errors: string[] }[]} invalid
 *   Rejected rows, 1-indexed, with i18n error codes (not display text).
 */

/**
 * @typedef {Object} ParserAdapter
 * @property {string} id
 *   Stable machine identifier, e.g. "interactive_brokers".
 * @property {string} label
 *   Human-readable name shown in the UI, e.g. "Interactive Brokers".
 * @property {(headers: string[], sampleRows: Object[]) => number} detect
 *   Confidence in [0,1] that this file was produced by this source. Return 0
 *   when it's definitely not ours. Should be cheap - it runs for every file.
 * @property {(rows: Object[], rawText?: string) => ParsedImport} parse
 *   Turn ALL data rows into normalized Trades. `rawText` is the original file
 *   text, provided for sources whose CSV has preamble/section rows a plain
 *   header parser can't handle. Parsers MUST normalize values through
 *   ../normalizers.js so date/direction/number handling stays consistent.
 */

// Minimum confidence for detect() to auto-select an adapter and skip the manual
// mapping step. Below this, the file falls back to generic column mapping.
export const DETECTION_CONFIDENCE_THRESHOLD = 0.6;

// Throws if `adapter` doesn't satisfy the ParserAdapter contract. Called by the
// registry at registration time so a malformed parser fails loudly at startup
// rather than silently during an import.
export function validateParser(adapter) {
  const missing = ["id", "label", "detect", "parse"].filter((key) => adapter?.[key] == null);
  if (missing.length) {
    throw new Error(`Invalid parser adapter: missing ${missing.join(", ")}`);
  }
  if (typeof adapter.detect !== "function" || typeof adapter.parse !== "function") {
    throw new Error(`Parser adapter "${adapter.id}" must expose detect() and parse() functions`);
  }
  return adapter;
}
