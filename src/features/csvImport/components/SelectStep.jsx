import { useRef } from "react";
import { C } from "../../trades/constants";
import Button from "../../../ui/Button";

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
      <Button variant="primary" icon="↑" disabled={pending} onClick={() => fileInputRef.current?.click()}>
        {t("chooseCsvFile")}
      </Button>
      <div style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>{t("csvOnlyUpTo", maxMb)}</div>
      <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{t("importFileHint")}</div>
      {error && <div style={{ color: C.red, fontSize: 12, marginTop: 10 }}>{error}</div>}
    </div>
  );
}
