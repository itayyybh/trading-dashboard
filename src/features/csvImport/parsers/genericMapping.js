import { applyMapping } from "../applyMapping";

// The fallback "adapter". When no broker parser recognizes a file, the user maps
// columns by hand (ImportFlow's mapping step) and that mapping is wrapped here
// into a ParserAdapter - so downstream code handles a hand-mapped file exactly
// like a recognized-broker file (identical parse() -> { valid, invalid }
// contract). This is what keeps the import pipeline format-agnostic.
//
// Two deliberate differences from broker adapters:
//   1. It's a FACTORY, not a singleton, because its logic (the column mapping)
//      is supplied by the user at runtime rather than baked in.
//   2. It is NOT registered in the parser registry: it has no fingerprint and
//      must never be auto-selected by detect() - it is the explicit last resort.
//      detect() returns 0 to enforce that even if it were ever registered.

export const GENERIC_PARSER_ID = "generic_mapping";

/**
 * Build a ParserAdapter from a user-confirmed { unifiedField: sourceHeader } map.
 * @param {Record<string, string>} mapping
 * @returns {import("../engine/adapterContract").ParserAdapter}
 */
export function createGenericMappingAdapter(mapping) {
  return {
    id: GENERIC_PARSER_ID,
    // Internal-only label - the generic path routes to the manual mapping UI
    // (which has its own i18n), so this is never surfaced as a "Detected:" badge.
    label: "Custom column mapping",
    detect: () => 0,
    parse: (rows) => applyMapping(rows, mapping),
  };
}
