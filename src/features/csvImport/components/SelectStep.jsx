import { useRef } from "react";
import { C } from "../../trades/constants";

// The initial file-picker screen. Purely presentational - the parent owns all
// import state and passes the selection handler down.
export default function SelectStep({ t, pending, error, maxMb, onFilesSelected }) {
  const fileInputRef = useRef(null);

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        multiple
        onChange={onFilesSelected}
        style={{ display: "none" }}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={pending}
        style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 20px", borderRadius: 20, border: `1px solid ${C.accent}`,
          background: C.accentDim, color: C.accent, fontSize: 13, fontWeight: 700,
          cursor: pending ? "default" : "pointer",
        }}
      >
        <span style={{ fontSize: 16 }}>↑</span> {t("chooseCsvFile")}
      </button>
      <div style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>{t("csvOnlyUpTo", maxMb)}</div>
      {error && <div style={{ color: C.red, fontSize: 12, marginTop: 10 }}>{error}</div>}
    </div>
  );
}
