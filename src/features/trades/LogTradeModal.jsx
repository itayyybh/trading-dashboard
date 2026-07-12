import { useState } from "react";
import { C } from "./constants";
import { useLocale } from "../../lib/i18n/LocaleContext";
import { UNIFIED_FIELDS, normalizeDirection, normalizeNumber, normalizeDate } from "../csvImport/applyMapping";
import { logManualTrade } from "./api/tradesApi";

const inputStyle = {
  background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8,
  padding: "8px 10px", color: C.text, fontSize: 13, width: "100%",
};

export default function LogTradeModal({ portfolioId, onClose, onSaved }) {
  const { t } = useLocale();
  const [values, setValues] = useState({ direction: "long" });
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);

  function setField(key, value) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const trade_date = normalizeDate(values.trade_date);
    const direction = normalizeDirection(values.direction);
    const symbol = String(values.symbol ?? "").trim();
    const pnl = normalizeNumber(values.pnl);

    const errors = [];
    if (!trade_date) errors.push("invalidDate");
    if (!direction) errors.push("unrecognizedDirection");
    if (!symbol) errors.push("missingSymbol");
    if (pnl === null) errors.push("invalidPnl");

    if (errors.length) {
      setError(errors.map((code) => t(code)).join(", "));
      return;
    }

    setPending(true);
    try {
      await logManualTrade(portfolioId, {
        trade_date,
        direction,
        symbol,
        pnl,
        entry_time: values.entry_time || null,
        exit_time: values.exit_time || null,
        quantity: normalizeNumber(values.quantity),
        entry_price: normalizeNumber(values.entry_price),
        exit_price: normalizeNumber(values.exit_price),
        fees: normalizeNumber(values.fees) ?? 0,
        raw_row: null,
      });
      onSaved?.();
    } catch (err) {
      setError(err.message);
      setPending(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
      <form
        onSubmit={handleSubmit}
        style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, width: 360, display: "flex", flexDirection: "column", gap: 12 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>{t("logTrade")}</h2>
          <button type="button" onClick={onClose} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 13 }}>{t("close")}</button>
        </div>

        <label style={{ fontSize: 12, color: C.muted, display: "flex", flexDirection: "column", gap: 4 }}>
          {t("date")} <span style={{ color: C.red }}>*</span>
          <input type="date" value={values.trade_date ?? ""} onChange={(e) => setField("trade_date", e.target.value)} style={inputStyle} />
        </label>

        <label style={{ fontSize: 12, color: C.muted, display: "flex", flexDirection: "column", gap: 4 }}>
          {t("directionField")} <span style={{ color: C.red }}>*</span>
          <select value={values.direction ?? "long"} onChange={(e) => setField("direction", e.target.value)} style={inputStyle}>
            <option value="long">{t("long")}</option>
            <option value="short">{t("short")}</option>
          </select>
        </label>

        <label style={{ fontSize: 12, color: C.muted, display: "flex", flexDirection: "column", gap: 4 }}>
          {t("symbolField")} <span style={{ color: C.red }}>*</span>
          <input value={values.symbol ?? ""} onChange={(e) => setField("symbol", e.target.value)} style={inputStyle} />
        </label>

        <label style={{ fontSize: 12, color: C.muted, display: "flex", flexDirection: "column", gap: 4 }}>
          {t("pnl")} <span style={{ color: C.red }}>*</span>
          <input value={values.pnl ?? ""} onChange={(e) => setField("pnl", e.target.value)} style={inputStyle} placeholder="e.g. 120 or -45.50" />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {UNIFIED_FIELDS.filter((f) => !f.required).map((field) => (
            <label key={field.key} style={{ fontSize: 12, color: C.muted, display: "flex", flexDirection: "column", gap: 4 }}>
              {t(field.labelKey)}
              <input value={values[field.key] ?? ""} onChange={(e) => setField(field.key, e.target.value)} style={inputStyle} />
            </label>
          ))}
        </div>

        {error && <div style={{ color: C.red, fontSize: 12 }}>{error}</div>}

        <button
          type="submit"
          disabled={pending}
          style={{
            marginTop: 6, padding: "9px 16px", borderRadius: 8, border: "none",
            background: pending ? C.border : C.accentDim, color: C.accent,
            fontWeight: 700, fontSize: 13, cursor: pending ? "default" : "pointer",
          }}
        >
          {pending ? t("saving") : t("save")}
        </button>
      </form>
    </div>
  );
}
