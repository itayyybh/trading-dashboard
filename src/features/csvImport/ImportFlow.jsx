import { useEffect, useRef, useState } from "react";
import { C } from "../trades/constants";
import { parseCsvPreview, parseCsvFull } from "./parseCsv";
import { UNIFIED_FIELDS, applyMapping, mapRow, guessMapping } from "./applyMapping";
import { listMappingTemplates, saveMappingTemplate } from "./mappingTemplatesApi";
import { importTrades, listImportBatches, DuplicateFileError } from "./importApi";
import { hashFile } from "./hashFile";
import { useLocale } from "../../lib/i18n/LocaleContext";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_ROWS = 10000;
const MAX_MB = MAX_FILE_BYTES / 1024 / 1024;

const selectStyle = {
  background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8,
  padding: "6px 8px", color: C.text, fontSize: 12, minWidth: 160,
};

export default function ImportFlow({ portfolioId, onImported, onClose }) {
  const { t } = useLocale();
  const fileInputRef = useRef(null);
  const [templates, setTemplates] = useState([]);

  // "select" -> "mapping" (one step per queued file) -> "review" -> "done"
  const [step, setStep] = useState("select");
  const [queue, setQueue] = useState([]); // [{ file, hash }] - files still to map
  const [queueIndex, setQueueIndex] = useState(0);
  const [skippedFiles, setSkippedFiles] = useState([]); // pre-filtered at selection time
  const [processedFiles, setProcessedFiles] = useState([]); // mapped + validated, not yet committed

  // Mapping state for the file currently at queue[queueIndex]
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

  async function loadFileForMapping(file) {
    const { headers, rows } = await parseCsvPreview(file, 20);
    setHeaders(headers);
    setPreviewRows(rows);
    setMapping(guessMapping(headers));
    setBrokerLabel("");
  }

  async function handleFilesSelected(e) {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    setError(null);
    setDoneSummary(null);
    setPending(true);

    const existing = await listImportBatches(portfolioId).catch(() => []);
    const existingHashes = new Map(existing.map((b) => [b.file_hash, b.created_at]));

    const nextQueue = [];
    const skipped = [];

    for (const f of selected) {
      if (!f.name.toLowerCase().endsWith(".csv")) {
        skipped.push({ filename: f.name, reason: "invalidType" });
        continue;
      }
      if (f.size > MAX_FILE_BYTES) {
        skipped.push({ filename: f.name, reason: "tooLarge" });
        continue;
      }
      const hash = await hashFile(f);
      if (existingHashes.has(hash)) {
        skipped.push({ filename: f.name, reason: "duplicate", date: existingHashes.get(hash) });
        continue;
      }
      nextQueue.push({ file: f, hash });
    }

    setSkippedFiles(skipped);
    setQueue(nextQueue);
    setQueueIndex(0);
    setProcessedFiles([]);

    if (nextQueue.length > 0) {
      await loadFileForMapping(nextQueue[0].file);
      setStep("mapping");
    } else {
      setStep("review");
    }
    setPending(false);
  }

  function applyTemplate(templateId) {
    const template = templates.find((tpl) => tpl.id === templateId);
    if (!template) return;
    setMapping(template.column_mapping);
    setBrokerLabel(template.broker_label);
  }

  function setFieldMapping(fieldKey, header) {
    setMapping((prev) => ({ ...prev, [fieldKey]: header || undefined }));
  }

  const requiredFieldsMapped = UNIFIED_FIELDS.filter((f) => f.required).every((f) => mapping[f.key]);
  const currentFile = queue[queueIndex]?.file ?? null;
  const isLastFile = queueIndex === queue.length - 1;

  async function handleConfirmFile() {
    setPending(true);
    setError(null);

    try {
      const { rows } = await parseCsvFull(currentFile);

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

      setProcessedFiles((prev) => [...prev, {
        filename: currentFile.name,
        fileHash: queue[queueIndex].hash,
        validTrades: valid,
        invalidCount: invalid.length,
        totalCount: rows.length,
        mappingTemplateId,
      }]);

      if (!isLastFile) {
        const nextIndex = queueIndex + 1;
        setQueueIndex(nextIndex);
        await loadFileForMapping(queue[nextIndex].file);
      } else {
        setStep("review");
      }
    } catch (e) {
      setError(e.message);
    }

    setPending(false);
  }

  async function handleImportAll() {
    setPending(true);
    setError(null);

    let imported = 0;
    let skippedRows = 0;
    const failed = [];

    for (const pf of processedFiles) {
      try {
        await importTrades({
          portfolioId,
          filename: pf.filename,
          fileHash: pf.fileHash,
          mappingTemplateId: pf.mappingTemplateId,
          trades: pf.validTrades,
        });
        imported += pf.validTrades.length;
        skippedRows += pf.invalidCount;
      } catch (e) {
        if (e instanceof DuplicateFileError) {
          failed.push({ filename: pf.filename, reason: "duplicate" });
        } else {
          failed.push({ filename: pf.filename, reason: "error", detail: e.message });
        }
      }
    }

    setDoneSummary({ imported, skippedRows, fileCount: processedFiles.length, failed });
    setStep("done");
    setPending(false);
    onImported?.();
  }

  function reset() {
    setStep("select");
    setQueue([]);
    setQueueIndex(0);
    setProcessedFiles([]);
    setSkippedFiles([]);
    setHeaders([]);
    setPreviewRows([]);
    setMapping({});
    setBrokerLabel("");
    setError(null);
    setDoneSummary(null);
  }

  function skippedFileLabel(s) {
    if (s.reason === "duplicate") return t("fileSkippedDuplicate", s.filename, new Date(s.date).toLocaleDateString());
    if (s.reason === "tooLarge") return t("fileSkippedTooLarge", s.filename, MAX_MB);
    return t("fileSkippedInvalidType", s.filename);
  }

  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: C.muted }}>{t("importTradesFromCsv")}</span>
        <button onClick={onClose} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 13 }}>{t("close")}</button>
      </div>

      {step === "done" && doneSummary ? (
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
          <button onClick={reset} style={{ padding: "7px 14px", borderRadius: 20, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 12, cursor: "pointer" }}>
            {t("importAnotherFile")}
          </button>
        </div>
      ) : step === "select" ? (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            multiple
            onChange={handleFilesSelected}
            style={{ display: "none" }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={pending}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 20px", borderRadius: 20, border: `1px solid ${C.accent}`,
              background: C.accentDim, color: C.accent, fontSize: 13, fontWeight: 700, cursor: pending ? "default" : "pointer",
            }}
          >
            <span style={{ fontSize: 16 }}>↑</span> {t("chooseCsvFile")}
          </button>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>{t("csvOnlyUpTo", MAX_MB)}</div>
          {error && <div style={{ color: C.red, fontSize: 12, marginTop: 10 }}>{error}</div>}
        </div>
      ) : step === "mapping" ? (
        <div>
          {queue.length > 1 && (
            <div style={{ fontSize: 11, color: C.accent, fontWeight: 700, marginBottom: 10 }}>
              {t("fileProgress", queueIndex + 1, queue.length)} — {currentFile?.name}
            </div>
          )}

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
              onClick={handleConfirmFile}
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
            <button onClick={reset} style={{ padding: "8px 18px", borderRadius: 20, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 13, cursor: "pointer" }}>
              {t("chooseDifferentFile")}
            </button>
          </div>
        </div>
      ) : (
        // step === "review"
        <div>
          {processedFiles.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 6, textTransform: "uppercase" }}>{t("filesReadyHeading")}</div>
              {processedFiles.map((pf) => (
                <div key={pf.filename} style={{ fontSize: 12, color: C.text, padding: "4px 0" }}>
                  {t("fileRowsSummary", pf.filename, pf.validTrades.length, pf.totalCount)}
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
                onClick={handleImportAll}
                disabled={pending}
                style={{
                  padding: "8px 18px", borderRadius: 20, border: "none",
                  background: pending ? C.border : C.accentDim,
                  color: C.accent, fontWeight: 700, fontSize: 13, cursor: pending ? "default" : "pointer",
                }}
              >
                {pending ? t("importing") : t("importAllLabel")}
              </button>
            )}
            <button onClick={reset} style={{ padding: "8px 18px", borderRadius: 20, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 13, cursor: "pointer" }}>
              {t("chooseDifferentFile")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
