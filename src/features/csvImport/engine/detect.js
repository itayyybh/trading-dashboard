import { getParsers } from "./parserRegistry";
import { DETECTION_CONFIDENCE_THRESHOLD } from "./adapterContract";
import { UNIFIED_FIELDS, guessMapping } from "../applyMapping";

const clamp01 = (n) => (Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0);

const REQUIRED_FIELDS = UNIFIED_FIELDS.filter((f) => f.required).map((f) => f.key);

// Heuristic: does this file even look like a TRADE export? Reuses the generic
// header-synonym guesser - if we can't recognize the columns that make a Trade
// (date / direction / symbol / pnl), it's probably not trade data at all (e.g. a
// portfolio holdings/balance snapshot, which has no trade date or P&L). This
// powers the "this doesn't look like trades" guardrail so the user isn't dropped
// into a mapping screen they can't complete. It is a SOFT signal: manual mapping
// stays available (a trade file with unusual/foreign headers may still land here).
export function assessTradePlausibility(headers) {
  const guess = guessMapping(headers);
  const matchedRequired = REQUIRED_FIELDS.filter((key) => guess[key]);
  // Recognizing 2+ of the 4 required trade columns = plausibly a trade file.
  const looksLikeTrades = matchedRequired.length >= 2;
  return { guess, matchedRequired, looksLikeTrades };
}

/**
 * Choose the best parser for a file, or classify it. Pure function - no IO, no
 * UI - so it's trivially testable and safe to call on a small header/sample.
 *
 * Returns one of:
 *   kind "recognized"   - a registered broker adapter matched confidently;
 *                         `parser` is set. UI can auto-parse and skip mapping.
 *   kind "generic"      - no broker matched, but it looks like trades; route to
 *                         the manual column-mapping flow.
 *   kind "unrecognized" - doesn't look like a trade file; UI should warn (mapping
 *                         still permitted, since the heuristic can miss).
 *
 * @param {string[]} headers
 * @param {Object[]} [sampleRows] a few parsed rows, for content-based detection
 * @param {string} [rawText] original file text, for section/preamble formats (IB)
 * @returns {{ kind: string, parser: import("./adapterContract").ParserAdapter | null,
 *             confidence: number, candidates: {parser: object, confidence: number}[],
 *             plausibility: {guess: object, matchedRequired: string[], looksLikeTrades: boolean} }}
 */
export function detectParser(headers, sampleRows = [], rawText = "") {
  const scored = getParsers()
    .map((parser) => ({ parser, confidence: clamp01(parser.detect(headers, sampleRows, rawText)) }))
    .filter((s) => s.confidence > 0)
    .sort((a, b) => b.confidence - a.confidence);

  const best = scored[0] ?? null;
  const plausibility = assessTradePlausibility(headers);
  const base = { candidates: scored, confidence: best?.confidence ?? 0, plausibility };

  if (best && best.confidence >= DETECTION_CONFIDENCE_THRESHOLD) {
    return { ...base, kind: "recognized", parser: best.parser };
  }
  if (plausibility.looksLikeTrades) {
    return { ...base, kind: "generic", parser: null };
  }
  return { ...base, kind: "unrecognized", parser: null };
}
