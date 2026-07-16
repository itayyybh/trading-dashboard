import { C } from "../../trades/constants";
import { UNIFIED_FIELDS, mapRow } from "../applyMapping";

const selectStyle = {
  background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8,
  padding: "6px 8px", color: C.text, fontSize: 12, minWidth: 160,
};

// Guardrail / status notice above the mapping controls. Shows a warning when the
// file doesn't look like trade data at all (the detection "unrecognized" case,
// e.g. a holdings/balance export) so the user isn't left guessing why nothing
// maps - while still letting them map manually if they know better.
function DetectionNotice({ t, detection }) {
  if (detection?.kind === "unrecognized") {
    return (
      <div style={{ background: C.goldDim, border: `1px solid ${C.gold}55`, borderRadius: 8, padding: "10px 12px", marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.gold, marginBottom: 4 }}>{t("notTradeFileTitle")}</div>
        <div style={{ fontSize: 11, color: C.textDim, lineHeight: 1.5 }}>{t("notTradeFileHint")}</div>
      </div>
    );
  }
  return (
    <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>
      {detection?.kind === "generic" ? t("noBrokerMatchedNote") : t("autoDetectedNote")}
    </div>
  );
}

// The manual column-mapping screen: pick which CSV column feeds each unified
// field, optionally load/save a broker template, and preview the first rows.
export default function MappingStep({
  t, detection, templates, queue, queueIndex, currentFile,
  headers, previewRows, mapping, brokerLabel, saveAsTemplate,
  requiredFieldsMapped, pending, error, isLastFile,
  onApplyTemplate, onSetFieldMapping, onSetBrokerLabel, onSetSaveAsTemplate, onConfirm, onReset,
}) {
  return (
    <div>
      {queue.length > 1 && (
        <div style={{ fontSize: 11, color: C.accent, fontWeight: 700, marginBottom: 10 }}>
          {t("fileProgress", queueIndex + 1, queue.length)} — {currentFile?.name}
        </div>
      )}

      {templates.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: C.muted, marginRight: 8 }}>{t("useSavedMapping")}</label>
          <select style={selectStyle} defaultValue="" onChange={(e) => e.target.value && onApplyTemplate(e.target.value)}>
            <option value="">{t("chooseTemplateOption")}</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>{template.broker_label}</option>
            ))}
          </select>
        </div>
      )}

      <DetectionNotice t={t} detection={detection} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        {UNIFIED_FIELDS.map((field) => (
          <div key={field.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={{ fontSize: 12, color: C.muted }}>
              {t(field.labelKey)}{field.required && <span style={{ color: C.red }}> *</span>}
            </label>
            <select
              style={selectStyle}
              value={mapping[field.key] ?? ""}
              onChange={(e) => onSetFieldMapping(field.key, e.target.value)}
            >
              <option value="">— none —</option>
              {headers.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
        <input
          placeholder={t("brokerNamePlaceholder")}
          value={brokerLabel}
          onChange={(e) => onSetBrokerLabel(e.target.value)}
          style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 10px", color: C.text, fontSize: 12, flex: 1 }}
        />
        <label style={{ fontSize: 12, color: C.muted, display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
          <input type="checkbox" checked={saveAsTemplate} onChange={(e) => onSetSaveAsTemplate(e.target.checked)} />
          {t("saveAsTemplateLabel")}
        </label>
      </div>

      <div style={{ overflowX: "auto", marginBottom: 14 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
          <thead>
            <tr style={{ color: C.muted, textAlign: "left" }}>
              <th style={{ padding: "4px 8px" }}>#</th>
              <th style={{ padding: "4px 8px" }}>{t("date")}</th>
              <th style={{ padding: "4px 8px" }}>{t("dirShort")}</th>
              <th style={{ padding: "4px 8px" }}>{t("symbolField")}</th>
              <th style={{ padding: "4px 8px" }}>{t("pnl")}</th>
              <th style={{ padding: "4px 8px" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {previewRows.slice(0, 5).map((row, i) => {
              const result = mapRow(row, mapping);
              return (
                <tr key={i} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: "4px 8px", color: C.muted }}>{i + 1}</td>
                  {result.ok ? (
                    <>
                      <td style={{ padding: "4px 8px" }}>{result.trade.trade_date}</td>
                      <td style={{ padding: "4px 8px" }}>{result.trade.direction}</td>
                      <td style={{ padding: "4px 8px" }}>{result.trade.symbol}</td>
                      <td style={{ padding: "4px 8px" }}>{result.trade.pnl}</td>
                      <td style={{ padding: "4px 8px", color: C.accent }}>{t("statusOk")}</td>
                    </>
                  ) : (
                    <td colSpan={4} style={{ padding: "4px 8px", color: C.red }}>{result.errors.map((code) => t(code)).join(", ")}</td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {error && <div style={{ color: C.red, fontSize: 12, marginBottom: 10 }}>{error}</div>}

      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={onConfirm}
          disabled={!requiredFieldsMapped || pending}
          style={{
            padding: "8px 18px", borderRadius: 20, border: "none",
            background: !requiredFieldsMapped || pending ? C.border : C.accentDim,
            color: C.accent, fontWeight: 700, fontSize: 13,
            cursor: !requiredFieldsMapped || pending ? "default" : "pointer",
          }}
        >
          {pending ? t("importing") : isLastFile ? t("reviewImportLabel") : t("nextFileLabel")}
        </button>
        <button onClick={onReset} style={{ padding: "8px 18px", borderRadius: 20, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 13, cursor: "pointer" }}>
          {t("chooseDifferentFile")}
        </button>
      </div>
    </div>
  );
}
