import { useRef, useState } from "react";
import { C, radius, space, transition, label as microLabel } from "../../../ui/theme";
import Button from "../../../ui/Button";
import { PLATFORM_BY_ID } from "../../portfolios/constants";

// The real broker platforms we can suggest as an upload source. The portfolio's
// `preferred_platforms` may also hold UI-only sentinels ("manual", "decide"),
// which aren't upload sources — so we filter to these.
const BROKER_IDS = ["tradingview", "interactive_brokers", "tradovate", "binance"];

// The initial import screen: a designed drag-and-drop dropzone plus a suggestion
// strip driven by the portfolio's preferred platforms. Suggestions are guidance
// only — auto-detection still handles any file from any source. Parent owns all
// import state; this is presentational.
export default function SelectStep({ t, pending, error, maxMb, preferredPlatforms = [], onFiles }) {
  const fileInputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const openBrowse = () => fileInputRef.current?.click();

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    if (pending) return;
    onFiles(e.dataTransfer.files);
  }

  // Prefer the portfolio's chosen sources; fall back to the full supported set
  // so the space still teaches when nothing was chosen.
  const chosen = (preferredPlatforms ?? [])
    .filter((id) => BROKER_IDS.includes(id))
    .map((id) => PLATFORM_BY_ID[id])
    .filter(Boolean);
  const usingFallback = chosen.length === 0;
  const platforms = usingFallback ? BROKER_IDS.map((id) => PLATFORM_BY_ID[id]) : chosen;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: space.lg }}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        multiple
        onChange={(e) => {
          onFiles(e.target.files);
          e.target.value = ""; // allow re-selecting the same file
        }}
        style={{ display: "none" }}
      />

      {/* Dropzone — a designed surface, not a bare placeholder */}
      <div
        role="button"
        tabIndex={0}
        aria-label={t("dropCsvHere")}
        onClick={openBrowse}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openBrowse();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!dragging) setDragging(true);
        }}
        onDragLeave={(e) => {
          if (e.currentTarget.contains(e.relatedTarget)) return;
          setDragging(false);
        }}
        onDrop={onDrop}
        style={{
          border: `1px solid ${dragging ? C.brand : C.border}`,
          background: dragging ? C.brandSoft : C.bgElevated,
          borderRadius: radius.lg,
          padding: "36px 24px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          cursor: pending ? "default" : "pointer",
          opacity: pending ? 0.7 : 1,
          transition: `border-color ${transition}, background ${transition}`,
        }}
      >
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: radius.md,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: C.brand,
            background: C.brandSoft,
            border: `1px solid ${C.brand}44`,
            marginBottom: 8,
            transition: `transform ${transition}`,
            transform: dragging ? "translateY(-2px)" : "none",
          }}
        >
          <UploadGlyph />
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{t("dropCsvHere")}</div>
        <div style={{ fontSize: 13, color: C.muted, maxWidth: 360, lineHeight: 1.5 }}>
          {t("orBrowseAutoDetect")}
        </div>
        <Button
          variant="secondary"
          size="sm"
          disabled={pending}
          onClick={(e) => {
            e.stopPropagation();
            openBrowse();
          }}
          style={{ marginTop: 12 }}
        >
          {t("browseFiles")}
        </Button>
        <div style={{ fontSize: 11.5, color: C.muted, marginTop: 10 }}>{t("csvConstraints", maxMb)}</div>
      </div>

      {/* Platform suggestions — personalized to the portfolio, non-mandatory */}
      {platforms.length > 0 && (
        <div>
          <div style={microLabel}>{usingFallback ? t("worksWith") : t("yourUsualSources")}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
            {platforms.map((p) => (
              <PlatformChip key={p.id} platform={p} disabled={pending} onClick={openBrowse} />
            ))}
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 10, lineHeight: 1.5, maxWidth: 460 }}>
            {t("importSourceHint")}
          </div>
        </div>
      )}

      {error && <div style={{ color: C.red, fontSize: 12.5 }}>{error}</div>}
    </div>
  );
}

// A suggested-source chip: real logo + name. Purely a shortcut into the file
// picker today; structured so a per-platform export guide can slot in later.
function PlatformChip({ platform, disabled, onClick }) {
  const [hover, setHover] = useState(false);
  const { Icon, label } = platform;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "7px 12px 7px 10px",
        borderRadius: radius.pill,
        border: `1px solid ${C.border}`,
        background: hover && !disabled ? C.panel2 : "transparent",
        color: hover && !disabled ? C.text : C.textDim,
        fontSize: 12.5,
        fontWeight: 600,
        cursor: disabled ? "default" : "pointer",
        transition: `background ${transition}, color ${transition}, border-color ${transition}`,
      }}
    >
      <Icon width="18" height="18" />
      {label}
    </button>
  );
}

function UploadGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 15V4" />
      <path d="M8 8l4-4 4 4" />
      <path d="M4 15v3a2 2 0 002 2h12a2 2 0 002-2v-3" />
    </svg>
  );
}
