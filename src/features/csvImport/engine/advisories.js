// Advisories flag files we RECOGNIZE but deliberately cannot import as trades,
// so the UI can tell the user what to do instead ("you exported the wrong
// file") rather than dropping them into a mapping screen that can't work.
// Unlike parser adapters, an advisory produces guidance, not trades.
//
// Advisory shape: { id, detect({ headers, sampleRows, rawText }) => boolean, messageKey }
// where messageKey is an i18n key rendered with the filename.

const advisories = [];

export function registerAdvisory(advisory) {
  if (!advisory?.id || typeof advisory.detect !== "function" || !advisory.messageKey) {
    throw new Error("Invalid advisory: needs id, detect(), messageKey");
  }
  // Idempotent by id (HMR-safe, same rationale as parserRegistry).
  const existing = advisories.findIndex((a) => a.id === advisory.id);
  if (existing >= 0) advisories[existing] = advisory;
  else advisories.push(advisory);
  return advisory;
}

export function getAdvisories() {
  return [...advisories];
}

export function clearAdvisories() {
  advisories.length = 0;
}

// The first advisory whose detector matches this file, or null.
export function matchAdvisory(headers = [], sampleRows = [], rawText = "") {
  const context = { headers, sampleRows, rawText };
  return getAdvisories().find((a) => a.detect(context)) ?? null;
}
