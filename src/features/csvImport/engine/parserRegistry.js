import { validateParser } from "./adapterContract";

// The single list of known parser adapters. Registration order is a tie-break
// hint only - detection ranks by confidence, not position (see detect.js). A
// source module registers itself by importing this and calling registerParser,
// so wiring a new broker in touches exactly one new file.
const registry = [];

export function registerParser(adapter) {
  validateParser(adapter);
  if (registry.some((p) => p.id === adapter.id)) {
    throw new Error(`Parser adapter "${adapter.id}" is already registered`);
  }
  registry.push(adapter);
  return adapter;
}

export function getParsers() {
  return [...registry];
}

// Reset hook for tests. Not used by app code.
export function clearParsers() {
  registry.length = 0;
}
