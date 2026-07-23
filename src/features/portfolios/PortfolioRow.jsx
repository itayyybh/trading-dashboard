import { useEffect, useRef, useState } from "react";
import { C, radius, transition, font } from "../../ui/theme";
import PortfolioActionsMenu from "./PortfolioActionsMenu";
import { ASSET_CLASS_BY_ID, PLATFORM_BY_ID } from "./constants";

// One row in the management list. Light and boxless — hierarchy comes from
// typography and whitespace, separated by hairlines, not cards. Rename happens
// inline; everything else routes through the "⋯" actions menu.
export default function PortfolioRow({
  portfolio,
  tradeCount = 0,
  archived = false,
  onRename,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
}) {
  const [hover, setHover] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(portfolio.name);
  const inputRef = useRef(null);

  useEffect(() => {
    if (renaming) inputRef.current?.select();
  }, [renaming]);

  function startRename() {
    setDraft(portfolio.name);
    setRenaming(true);
  }

  async function commitRename() {
    const name = draft.trim();
    setRenaming(false);
    if (name && name !== portfolio.name) await onRename(name);
  }

  const asset = portfolio.asset_class ? ASSET_CLASS_BY_ID[portfolio.asset_class] : null;
  const platforms = (portfolio.preferred_platforms ?? []).map((id) => PLATFORM_BY_ID[id]).filter(Boolean);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "14px 12px",
        borderRadius: radius.md,
        background: hover ? C.panel2 : "transparent",
        borderTop: `1px solid ${C.borderSoft}`,
        transition: `background ${transition}`,
        opacity: archived ? 0.75 : 1,
      }}
    >
      {/* Identity */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {renaming ? (
          <input
            ref={inputRef}
            autoFocus
            className="dash-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") setRenaming(false);
            }}
            maxLength={80}
            style={{
              background: C.bgElevated,
              border: `1px solid ${C.brand}`,
              borderRadius: radius.sm,
              padding: "5px 9px",
              color: C.text,
              fontSize: 14.5,
              fontWeight: 700,
              width: "min(320px, 100%)",
              outline: "none",
            }}
          />
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ fontSize: 14.5, fontWeight: 700, color: C.text, letterSpacing: "-0.01em" }}>
              {portfolio.name}
            </span>
            {archived && (
              <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: C.muted }}>
                Archived
              </span>
            )}
          </div>
        )}

        {/* Meta: asset class · platforms — quiet, scannable, no chips clutter */}
        <MetaLine asset={asset} platforms={platforms} description={portfolio.description} />
      </div>

      {/* Trade count */}
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontFamily: font.mono, fontVariantNumeric: "tabular-nums", fontSize: 14, color: C.text }}>
          {tradeCount}
        </div>
        <div style={{ fontSize: 10.5, letterSpacing: 0.6, textTransform: "uppercase", color: C.muted, fontWeight: 600 }}>
          {tradeCount === 1 ? "trade" : "trades"}
        </div>
      </div>

      <PortfolioActionsMenu
        items={[
          { label: "Rename", onClick: startRename },
          { label: "Edit", onClick: onEdit },
          { label: "Archive", onClick: onArchive, hidden: archived },
          { label: "Unarchive", onClick: onUnarchive, hidden: !archived },
          { label: "Delete", onClick: onDelete, danger: true },
        ]}
      />
    </div>
  );
}

function MetaLine({ asset, platforms, description }) {
  const parts = [];
  if (asset) parts.push(asset.label);
  if (platforms.length) parts.push(platforms.map((p) => p.label).join(", "));

  if (!parts.length && !description) return null;

  return (
    <div style={{ fontSize: 12.5, color: C.muted, marginTop: 4, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
      {parts.join("  ·  ")}
      {description && (parts.length ? `  ·  ${description}` : description)}
    </div>
  );
}
