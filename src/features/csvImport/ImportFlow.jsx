import { useEffect, useRef, useState } from "react";
import { C } from "../trades/constants";
import { parseCsvPreview, parseCsvFull } from "./parseCsv";
import { UNIFIED_FIELDS, applyMapping, mapRow, guessMapping } from "./applyMapping";
import { listMappingTemplates, saveMappingTemplate } from "./mappingTemplatesApi";
import { importTrades } from "./importApi";
import { useLocale } from "../../lib/i18n/LocaleContext";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_ROWS = 10000;

const selectStyle = {
  background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8,
  padding: "6px 8px", color: C.text, fontSize: 12, minWidth: 160,
};

export default function ImportFlow({ portfolioId, onImported, onClose }) {
  const { t } = useLocale();
  const fileInputRef = useRef(null);
  const [templates, setTemplates] = useState([]);
  const [file, setFile] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [previewRows, setPreviewRows] = useState([]);
  const [mapping, setMapping] = useState({});
  const [brokerLabel, setBrokerLabel] = useState("");
  const [saveAsTemplate, setSaveAsTemplate] = useState(true);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);
  const [doneSummary, setDoneSummary] = useState(null);

  useEffect(() => {
    listMappingTemplates().then(setTemplates).catch(() => {});
  }, []);

  async function handleFileChange(e) {
    const f = e.target.files[0];
    if (!f) return;
    setError(null);
    setDoneSummary(null);

    if (!f.name.toLowerCase().endsWith(".csv")) {
      setError(t("onlyCsvSupported"));
      return;
    }

    if (f.size > MAX_FILE_BYTES) {
      setError(t("fileTooLarge", MAX_FILE_BYTES / 1024 / 1024));
      return;
    }

    const { headers, rows } = await parseCsvPreview(f, 20);
    setFile(f);
    setHeaders(headers);
    setPreviewRows(rows);
    setMapping(guessMapping(headers));
    setBrokerLabel("");
  }

  function applyTemplate(templateId) {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;
    setMapping(template.column_mapping);
    setBrokerLabel(template.broker_label);
  }

  function setFieldMapping(fieldKey, header) {
    setMapping((prev) => ({ ...prev, [fieldKey]: header || undefined }));
  }

  const requiredFieldsMapped = UNIFIED_FIELDS.filter((f) => f.required).every((f) => mapping[f.key]);

  async function handleImport() {
    setPending(true);
    setError(null);

    try {
      const { rows } = await parseCsvFull(file);

      if (rows.length > MAX_ROWS) {
        setError(t("rowsTooMany", rows.length, MAX_ROWS));
        setPending(false);
        return;
      }

      const { valid, invalid } = applyMapping(rows, mapping);

      let mappingTemplateId = null;
      if (saveAsTemplate && brokerLabel.trim()) {
        const saved = await saveMappingTemplate(brokerLabel.trim(), mapping);
        mappingTemplateId = saved.id;
        setTemplates((prev) => [saved, ...prev]);
      }

      await importTrades({
        portfolioId,
        filename: file.name,
        mappingTemplateId,
        trades: valid,
      });

      setDoneSummary({ imported: valid.length, skipped: invalid.length, total: rows.length });
      onImported?.();
    } catch (e) {
      setError(e.message);
    }

    setPending(false);
  }

  function reset() {
    setFile(null);
    setHeaders([]);
    setPreviewRows([]);
    setMapping({});
    setBrokerLabel("");
    setDoneSummary(null);
    setError(null);
  }

  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: C.muted }}>{t("importTradesFromCsv")}</span>
        <button onClick={onClose} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 13 }}>{t("close")}</button>
      </div>

      {doneSummary ? (
        <div>
          <div style={{ color: C.accent, fontWeight: 700, marginBottom: 6 }}>
            {t("importedOfRows", doneSummary.imported, doneSummary.total)}
          </div>
          {doneSummary.skipped > 0 && (
            <div style={{ color: C.gold, fontSize: 13, marginBottom: 12 }}>
              {t("skippedRows", doneSummary.skipped)}
            </div>
          )}
          <button onClick={reset} style={{ padding: "7px 14px", borderRadius: 20, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 12, cursor: "pointer" }}>
            {t("importAnotherFile")}
          </button>
        </div>
      ) : !file ? (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 20px", borderRadius: 20, border: `1px solid ${C.accent}`,
              background: C.accentDim, color: C.accent, fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 16 }}>↑</span> {t("chooseCsvFile")}
          </button>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>{t("csvOnlyUpTo", MAX_FILE_BYTES / 1024 / 1024)}</div>
          {error && <div style={{ color: C.red, fontSize: 12, marginTop: 10 }}>{error}</div>}
        </div>
      ) : (
        <div>
          {templates.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: C.muted, marginRight: 8 }}>{t("useSavedMapping")}</label>
              <select style={selectStyle} defaultValue="" onChange={(e) => e.target.value && applyTemplate(e.target.value)}>
                <option value="">{t("chooseTemplateOption")}</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>{template.broker_label}</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>
            {t("autoDetectedNote")}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            {UNIFIED_FIELDS.map((field) => (
              <div key={field.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontSize: 12, color: C.muted }}>
                  {t(field.labelKey)}{field.required && <span style={{ color: C.red }}> *</span>}
                </label>
                <select
                  style={selectStyle}
                  value={mapping[field.key] ?? ""}
                  onChange={(e) => setFieldMapping(field.key, e.target.value)}
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
              onChange={(e) => setBrokerLabel(e.target.value)}
              style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 10px", color: C.text, fontSize: 12, flex: 1 }}
            />
            <label style={{ fontSize: 12, color: C.muted, display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
              <input type="checkbox" checked={saveAsTemplate} onChange={(e) => setSaveAsTemplate(e.target.checked)} />
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
              onClick={handleImport}
              disabled={!requiredFieldsMapped || pending}
              style={{
                padding: "8px 18px", borderRadius: 20, border: "none",
                background: !requiredFieldsMapped || pending ? C.border : C.accentDim,
                color: C.accent, fontWeight: 700, fontSize: 13,
                cursor: !requiredFieldsMapped || pending ? "default" : "pointer",
              }}
            >
              {pending ? t("importing") : t("importLabel")}
            </button>
            <button onClick={reset} style={{ padding: "8px 18px", borderRadius: 20, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 13, cursor: "pointer" }}>
              {t("chooseDifferentFile")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
