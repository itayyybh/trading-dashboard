import { validateParser } from "./adapterContract";

// The single list of known parser adapters. Registration order is a tie-break
// hint only - detection ranks by confidence, not position (see detect.js). A
// source module registers itself by importing this and calling registerParser,
// so wiring a new broker in touches exactly one new file.
const registry = [];

export function registerParser(adapter) {
  validateParser(adapter);
  // Idempotent by id: re-registering the same adapter replaces it rather than
  // throwing. This keeps the registry correct when a self-registering module is
  // re-executed - notably under Vite HMR in dev, where index.js re-runs on every
  // hot update. A genuine id clash between two different adapters is a build-time
  // authoring bug, caught in review, not a runtime concern.
  const existing = registry.findIndex((p) => p.id === adapter.id);
  if (existing >= 0) {
    registry[existing] = adapter;
  } else {
    registry.push(adapter);
  }
  return adapter;
}

export function getParsers() {
  return [...registry];
}

// Reset hook for tests. Not used by app code.
export function clearParsers() {
  registry.length = 0;
}
