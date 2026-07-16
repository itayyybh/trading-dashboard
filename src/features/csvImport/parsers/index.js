import { registerParser } from "../engine/parserRegistry";
import { registerAdvisory } from "../engine/advisories";
import interactiveBrokers from "./interactiveBrokers";
import tradingView from "./tradingView";
import { tradingViewOrderHistory, tradingViewJournal } from "./tradingViewAdvisories";

// Central registration point for all broker parser adapters. Importing this
// module once (from ImportFlow) populates the registry so detectParser() sees
// every source. Adding a broker = one import + one registerParser line here,
// plus its parser file - nothing else in the engine or UI changes.
registerParser(interactiveBrokers);
registerParser(tradingView);

// Advisories: files we recognize but can't import, so the UI can guide the user
// to the right export instead of dead-ending them.
registerAdvisory(tradingViewOrderHistory);
registerAdvisory(tradingViewJournal);

// The generic column-mapping adapter is NOT registered (it has no fingerprint
// and must never be auto-detected) - re-exported here for convenient access.
export { createGenericMappingAdapter, GENERIC_PARSER_ID } from "./genericMapping";
