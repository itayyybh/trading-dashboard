import { C } from "../../trades/constants";

// Final confirmation screen: files parsed and ready (auto-detected or manually
// mapped), files that were skipped up front, and the "Import All" action.
// Auto-detected files show which broker was recognized and offer an escape
// hatch to map them by hand instead.
export default function ReviewStep({
  t, processedFiles, skippedFiles, pending, error,
  onImportAll, onReset, onRemapFile, skippedFileLabel,
}) {
  return (
    <div>
      {processedFiles.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 6, textTransform: "uppercase" }}>{t("filesReadyHeading")}</div>
          {processedFiles.map((pf) => (
            <div key={pf.filename} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "4px 0" }}>
              <div style={{ fontSize: 12, color: C.text }}>
                {t("fileRowsSummary", pf.filename, pf.validTrades.length, pf.totalCount)}
                {pf.source === "auto" && pf.detectedLabel && (
                  <span style={{ marginInlineStart: 8, fontSize: 11, color: C.brand, fontWeight: 600 }}>
                    {t("autoDetectedBadge", pf.detectedLabel)}
                  </span>
                )}
              </div>
              {pf.source === "auto" && (
                <button
                  onClick={() => onRemapFile(pf)}
                  disabled={pending}
                  style={{ background: "transparent", border: "none", color: C.muted, fontSize: 11, textDecoration: "underline", cursor: pending ? "default" : "pointer", whiteSpace: "nowrap" }}
                >
                  {t("mapManuallyInstead")}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {skippedFiles.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, marginBottom: 6, textTransform: "uppercase" }}>{t("filesSkippedHeading")}</div>
          {skippedFiles.map((s) => (
            <div key={s.filename} style={{ fontSize: 12, color: C.gold, padding: "4px 0" }}>{skippedFileLabel(s)}</div>
          ))}
        </div>
      )}

      {error && <div style={{ color: C.red, fontSize: 12, marginBottom: 10 }}>{error}</div>}

      <div style={{ display: "flex", gap: 10 }}>
        {processedFiles.length > 0 && (
          <button
            onClick={onImportAll}
            disabled={pending}
            style={{
              padding: "8px 18px", borderRadius: 999,
              border: `1px solid ${pending ? C.border : "#818cf866"}`,
              background: pending ? C.border : C.brandDim,
              color: pending ? C.muted : C.brand, fontWeight: 700, fontSize: 13, cursor: pending ? "default" : "pointer",
            }}
          >
            {pending ? t("importing") : t("importAllLabel")}
          </button>
        )}
        <button onClick={onReset} style={{ padding: "8px 18px", borderRadius: 20, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 13, cursor: "pointer" }}>
          {t("chooseDifferentFile")}
        </button>
      </div>
    </div>
  );
}
