import { useState } from "react";
import { C, ASSET_COLORS, font } from "../../../ui/theme";
import ChartCard from "../../../ui/ChartCard";
import Badge from "../../../ui/Badge";
import { fmt } from "../format";
import { useLocale } from "../../../lib/i18n/LocaleContext";

export default function TradeLogTable({ trades, onEdit }) {
  const { t } = useLocale();
  const headers = [t("date"), t("entry"), t("exit"), t("dirShort"), t("asset"), t("pnl")];

  return (
    <ChartCard
      title={t("tradeLog")}
      collapsible
      defaultCollapsed
      right={<span style={{ fontSize: 11, color: C.muted }}>{t("tradesSuffix", trades.length)}</span>}
    >
      <div style={{ overflowX: "auto", margin: "0 -20px -20px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th
                  key={h}
                  style={{
                    padding: "8px 12px",
                    borderBottom: `1px solid ${C.border}`,
                    color: C.muted,
                    fontWeight: 600,
                    fontSize: 10,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    textAlign: i === headers.length - 1 ? "right" : "left",
                    position: "sticky",
                    top: 0,
                    background: C.panel,
                  }}
                >
                  {h}
                </th>
              ))}
              <th style={{ borderBottom: `1px solid ${C.border}`, background: C.panel, position: "sticky", top: 0 }} />
            </tr>
          </thead>
          <tbody>
            {trades.map((tr, i) => (
              <TradeRow key={tr.id ?? i} tr={tr} t={t} last={i === trades.length - 1} onEdit={onEdit} />
            ))}
          </tbody>
        </table>
      </div>
    </ChartCard>
  );
}

function TradeRow({ tr, t, last, onEdit }) {
  const [hover, setHover] = useState(false);
  const cell = { padding: "9px 12px", borderBottom: last ? "none" : `1px solid ${C.borderSoft}` };

  return (
    <tr
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ background: hover ? C.panel2 : "transparent", transition: "background 120ms" }}
    >
      <td style={{ ...cell, color: C.muted, fontFamily: font.mono }}>{tr.date}</td>
      <td style={{ ...cell, fontFamily: font.mono, color: C.textDim }}>{tr.entry}</td>
      <td style={{ ...cell, fontFamily: font.mono, color: C.textDim }}>{tr.exit}</td>
      <td style={cell}>
        <Badge tone={tr.dir === "Long" ? "pos" : "gold"}>{tr.dir === "Long" ? t("long") : t("short")}</Badge>
      </td>
      <td style={{ ...cell, color: ASSET_COLORS[tr.asset] || C.text, fontWeight: 600 }}>{tr.asset}</td>
      <td
        style={{
          ...cell,
          textAlign: "right",
          fontFamily: font.mono,
          fontVariantNumeric: "tabular-nums",
          fontWeight: 700,
          color: tr.pnl >= 0 ? C.accent : C.red,
        }}
      >
        {fmt(tr.pnl)}
      </td>
      <td style={{ ...cell, textAlign: "right", width: 1, whiteSpace: "nowrap" }}>
        <button
          type="button"
          onClick={() => onEdit?.(tr)}
          aria-label={t("editTrade")}
          style={{
            background: "transparent",
            border: `1px solid ${C.border}`,
            borderRadius: 6,
            color: hover ? C.text : C.muted,
            cursor: "pointer",
            fontSize: 11,
            padding: "3px 9px",
            transition: "color 120ms",
          }}
        >
          {t("edit")}
        </button>
      </td>
    </tr>
  );
}
