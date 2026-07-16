import { C } from "../../trades/constants";

// Post-import summary: how many rows landed, how many were skipped, and any
// per-file failures. Presentational only.
export default function DoneStep({ t, doneSummary, onReset }) {
  return (
    <div>
      <div style={{ color: C.accent, fontWeight: 700, marginBottom: 6 }}>
        {t("importedAcrossFiles", doneSummary.imported, doneSummary.fileCount)}
      </div>
      {doneSummary.skippedRows > 0 && (
        <div style={{ color: C.gold, fontSize: 13, marginBottom: 6 }}>{t("skippedRows", doneSummary.skippedRows)}</div>
      )}
      {doneSummary.failed.length > 0 && (
        <div style={{ color: C.red, fontSize: 13, marginBottom: 12 }}>
          {doneSummary.failed.map((f) => (
            <div key={f.filename}>{f.reason === "duplicate" ? t("fileSkippedDuplicate", f.filename, t("importLabel")) : `${f.filename}: ${f.detail}`}</div>
          ))}
        </div>
      )}
      <button onClick={onReset} style={{ padding: "7px 14px", borderRadius: 20, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 12, cursor: "pointer" }}>
        {t("importAnotherFile")}
      </button>
    </div>
  );
}
