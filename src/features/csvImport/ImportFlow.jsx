import { useEffect, useState } from "react";
import { C } from "../trades/constants";
import { parseCsvPreview, parseCsvFull } from "./parseCsv";
import { UNIFIED_FIELDS } from "./applyMapping";
import { detectParser } from "./engine/detect";
import { createGenericMappingAdapter } from "./parsers"; // importing also registers broker parsers
import { listMappingTemplates, saveMappingTemplate } from "./mappingTemplatesApi";
import { importTrades, listImportBatches, DuplicateFileError } from "./importApi";
import { hashFile } from "./hashFile";
import { useLocale } from "../../lib/i18n/LocaleContext";
import SelectStep from "./components/SelectStep";
import MappingStep from "./components/MappingStep";
import ReviewStep from "./components/ReviewStep";
import DoneStep from "./components/DoneStep";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_ROWS = 10000;
const MAX_MB = MAX_FILE_BYTES / 1024 / 1024;

export default function ImportFlow({ portfolioId, onImported, onClose }) {
  const { t } = useLocale();
  const [templates, setTemplates] = useState([]);

  // "select" -> "mapping" (only for files needing manual mapping) -> "review" -> "done"
  const [step, setStep] = useState("select");
  const [queue, setQueue] = useState([]); // [{ file, hash }] - files still to map
  const [queueIndex, setQueueIndex] = useState(0);
  const [skippedFiles, setSkippedFiles] = useState([]); // pre-filtered (bad type/size/dup/too many rows)
  const [processedFiles, setProcessedFiles] = useState([]); // parsed + validated, not yet committed

  // Mapping state for the file currently at queue[queueIndex]
  const [headers, setHeaders] = useState([]);
  const [previewRows, setPreviewRows] = useState([]);
  const [mapping, setMapping] = useState({});
  const [brokerLabel, setBrokerLabel] = useState("");
  const [saveAsTemplate, setSaveAsTemplate] = useState(true);
  const [detection, setDetection] = useState(null); // detectParser() result for the current file

  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);
  const [doneSummary, setDoneSummary] = useState(null);

  useEffect(() => {
    listMappingTemplates().then(setTemplates).catch(() => {});
  }, []);

  // Walk the queue from `startIndex`, auto-importing every file a broker parser
  // recognizes and stopping at the first file that needs manual mapping. Runs of
  // recognized files are parsed without ever showing the mapping UI ("import
  // immediately"); the loop stays paused on a manual file until the user confirms
  // it, which calls back in to resume. Accumulators are passed in (not read from
  // state) so a single pass stays consistent across awaits.
  async function processQueueFrom(startIndex, q, processedInit, skippedInit) {
    const processed = [...processedInit];
    const skipped = [...skippedInit];

    for (let i = startIndex; i < q.length; i += 1) {
      const { file, hash } = q[i];
      const rawText = await file.text();
      const { headers: fileHeaders, rows: preview } = await parseCsvPreview(file, 20);
      const det = detectParser(fileHeaders, preview, rawText);

      if (det.kind === "recognized") {
        try {
          const { rows } = await parseCsvFull(file);
          const { valid, invalid } = det.parser.parse(rows, rawText);
          const total = valid.length + invalid.length;
          if (total > MAX_ROWS) {
            skipped.push({ filename: file.name, reason: "rowsTooMany", count: total });
            continue;
          }
          processed.push({
            filename: file.name, fileHash: hash, file,
            validTrades: valid, invalidCount: invalid.length, totalCount: total,
            mappingTemplateId: null, detectedLabel: det.parser.label, source: "auto",
          });
          continue;
        } catch {
          // Detection was confident but parsing failed - fall back to manual
          // mapping for this file rather than dropping it.
          pauseForManualMapping(i, fileHeaders, preview, { ...det, kind: "generic" }, processed, skipped);
          return;
        }
      }

      // A known-but-unimportable file (e.g. the wrong export from a supported
      // broker): report it with specific guidance instead of a mapping dead-end.
      if (det.kind === "advisory") {
        skipped.push({ filename: file.name, reason: "advisory", messageKey: det.advisory.messageKey });
        continue;
      }

      // "generic" or "unrecognized" -> the user maps this file by hand.
      pauseForManualMapping(i, fileHeaders, preview, det, processed, skipped);
      return;
    }

    // Reached the end with nothing left to map.
    setSkippedFiles(skipped);
    setProcessedFiles(processed);
    setStep("review");
  }

  // Commit the in-progress accumulators to state and show the mapping screen for
  // the file at `index`, pre-filling the guessed mapping from detection.
  function pauseForManualMapping(index, fileHeaders, preview, det, processed, skipped) {
    setQueueIndex(index);
    setHeaders(fileHeaders);
    setPreviewRows(preview);
    setMapping(det.plausibility.guess);
    setBrokerLabel("");
    setDetection(det);
    setProcessedFiles(processed);
    setSkippedFiles(skipped);
    setStep("mapping");
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

    setQueue(nextQueue);
    setQueueIndex(0);
    try {
      await processQueueFrom(0, nextQueue, [], skipped);
    } catch (err) {
      setError(err.message);
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

      const { valid, invalid } = createGenericMappingAdapter(mapping).parse(rows);

      let mappingTemplateId = null;
      if (saveAsTemplate && brokerLabel.trim()) {
        const saved = await saveMappingTemplate(brokerLabel.trim(), mapping);
        mappingTemplateId = saved.id;
        setTemplates((prev) => [saved, ...prev]);
      }

      const entry = {
        filename: currentFile.name, fileHash: queue[queueIndex].hash, file: currentFile,
        validTrades: valid, invalidCount: invalid.length, totalCount: rows.length,
        mappingTemplateId, detectedLabel: null, source: "manual",
      };

      // Continue auto-processing any remaining files after this manual one.
      await processQueueFrom(queueIndex + 1, queue, [...processedFiles, entry], skippedFiles);
    } catch (e) {
      setError(e.message);
    }

    setPending(false);
  }

  // "Map manually" on the review screen: pull an auto-detected file back out and
  // route it through the manual mapping flow instead.
  async function remapFile(pf) {
    setPending(true);
    setError(null);
    try {
      const remaining = processedFiles.filter((p) => p !== pf);
      const rawText = await pf.file.text();
      const { headers: fileHeaders, rows: preview } = await parseCsvPreview(pf.file, 20);
      const det = detectParser(fileHeaders, preview, rawText);
      setQueue([{ file: pf.file, hash: pf.fileHash }]);
      // Force the manual path even though detection recognized it - the user asked.
      pauseForManualMapping(0, fileHeaders, preview, { ...det, kind: det.kind === "recognized" ? "generic" : det.kind }, remaining, skippedFiles);
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
    setDetection(null);
    setError(null);
    setDoneSummary(null);
  }

  function skippedFileLabel(s) {
    if (s.reason === "duplicate") return t("fileSkippedDuplicate", s.filename, new Date(s.date).toLocaleDateString());
    if (s.reason === "tooLarge") return t("fileSkippedTooLarge", s.filename, MAX_MB);
    if (s.reason === "rowsTooMany") return t("rowsTooMany", s.count, MAX_ROWS);
    if (s.reason === "advisory") return t(s.messageKey, s.filename);
    return t("fileSkippedInvalidType", s.filename);
  }

  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: C.muted }}>{t("importTradesFromCsv")}</span>
        <button onClick={onClose} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 13 }}>{t("close")}</button>
      </div>

      {step === "done" && doneSummary ? (
        <DoneStep t={t} doneSummary={doneSummary} onReset={reset} />
      ) : step === "select" ? (
        <SelectStep t={t} pending={pending} error={error} maxMb={MAX_MB} onFilesSelected={handleFilesSelected} />
      ) : step === "mapping" ? (
        <MappingStep
          t={t}
          detection={detection}
          templates={templates}
          queue={queue}
          queueIndex={queueIndex}
          currentFile={currentFile}
          headers={headers}
          previewRows={previewRows}
          mapping={mapping}
          brokerLabel={brokerLabel}
          saveAsTemplate={saveAsTemplate}
          requiredFieldsMapped={requiredFieldsMapped}
          pending={pending}
          error={error}
          isLastFile={isLastFile}
          onApplyTemplate={applyTemplate}
          onSetFieldMapping={setFieldMapping}
          onSetBrokerLabel={setBrokerLabel}
          onSetSaveAsTemplate={setSaveAsTemplate}
          onConfirm={handleConfirmFile}
          onReset={reset}
        />
      ) : (
        <ReviewStep
          t={t}
          processedFiles={processedFiles}
          skippedFiles={skippedFiles}
          pending={pending}
          error={error}
          onImportAll={handleImportAll}
          onReset={reset}
          onRemapFile={remapFile}
          skippedFileLabel={skippedFileLabel}
        />
      )}
    </div>
  );
}
