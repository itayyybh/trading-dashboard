import { useMemo, useState } from "react";
import { C } from "../constants";
import { fmt } from "../format";
import SectionTitle from "./SectionTitle";
import { useLocale } from "../../../lib/i18n/LocaleContext";

// Parse a "YYYY-MM-DD" string into numeric parts by hand. We avoid new Date(str)
// on purpose: it parses as UTC midnight and can render the previous day for
// non-UTC users (same day-shift footgun handled in csvImport/applyMapping.js).
function parseIso(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return { year: y, month: m, day: d };
}

const pad = (n) => String(n).padStart(2, "0");

export default function PnlCalendar({ byDay }) {
  const { t } = useLocale();

  // Map of "YYYY-MM-DD" -> { pnl, count } for O(1) day lookups.
  const dayMap = useMemo(() => {
    const map = {};
    for (const d of byDay) map[d.date] = { pnl: d.pnl, count: d.count ?? 0 };
    return map;
  }, [byDay]);

  // Default to the month of the most recent trade so there's data on screen.
  const latest = useMemo(() => {
    let max = null;
    for (const d of byDay) if (!max || d.date > max) max = d.date;
    return max ? parseIso(max) : null;
  }, [byDay]);

  const [view, setView] = useState(() =>
    latest ? { year: latest.year, month: latest.month - 1 } : { year: 2000, month: 0 }
  );

  function shiftMonth(delta) {
    setView((v) => {
      const next = new Date(v.year, v.month + delta, 1); // local constructor: no UTC shift
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  }

  const monthNames = t("monthNames");
  const weekdayNames = t("weekdayNames");

  // Build the grid: leading blanks for the weekday offset, then each day.
  // new Date(y, m, 1/0) uses the local constructor, safe from UTC day-shift.
  const firstWeekday = new Date(view.year, view.month, 1).getDay(); // 0=Sun..6=Sat
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);

  // Scale cube opacity by |pnl| relative to the biggest day this month, so a
  // heavy day reads brighter than a marginal one while staying clearly red/green.
  const monthMaxAbs = useMemo(() => {
    let max = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const entry = dayMap[`${view.year}-${pad(view.month + 1)}-${pad(day)}`];
      if (entry) max = Math.max(max, Math.abs(entry.pnl));
    }
    return max;
  }, [dayMap, view, daysInMonth]);

  let monthTotal = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const entry = dayMap[`${view.year}-${pad(view.month + 1)}-${pad(day)}`];
    if (entry) monthTotal += entry.pnl;
  }

  const navBtn = {
    width: 28,
    height: 28,
    borderRadius: 8,
    border: `1px solid ${C.border}`,
    background: "transparent",
    color: C.muted,
    fontSize: 15,
    lineHeight: 1,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div
      dir="ltr"
      style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 16 }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <SectionTitle>{t("pnlCalendar")}</SectionTitle>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: monthTotal >= 0 ? C.accent : C.red, fontFamily: "'SF Mono', monospace" }}>
            {t("monthTotal", fmt(monthTotal))}
          </span>
          <button type="button" aria-label={t("prevMonth")} onClick={() => shiftMonth(-1)} style={navBtn}>‹</button>
          <span style={{ fontSize: 13, fontWeight: 700, minWidth: 128, textAlign: "center", color: C.text }}>
            {monthNames[view.month]} {view.year}
          </span>
          <button type="button" aria-label={t("nextMonth")} onClick={() => shiftMonth(1)} style={navBtn}>›</button>
        </div>
      </div>

      {/* Weekday header row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 6 }}>
        {weekdayNames.map((w) => (
          <div key={w} style={{ textAlign: "center", fontSize: 10, fontWeight: 600, letterSpacing: 0.5, color: C.muted, textTransform: "uppercase" }}>
            {w}
          </div>
        ))}
      </div>

      {/* Day cubes */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
        {cells.map((day, i) => {
          if (day === null) return <div key={`blank-${i}`} />;

          const iso = `${view.year}-${pad(view.month + 1)}-${pad(day)}`;
          const entry = dayMap[iso];
          const hasTrades = !!entry;
          const profit = hasTrades && entry.pnl >= 0;

          let background = C.bg;
          let borderColor = C.border;
          if (hasTrades) {
            const intensity = monthMaxAbs > 0 ? 0.35 + 0.65 * (Math.abs(entry.pnl) / monthMaxAbs) : 0.7;
            const base = profit ? C.accent : C.red;
            background = base + Math.round(intensity * 255).toString(16).padStart(2, "0");
            borderColor = base;
          }

          return (
            <div
              key={iso}
              title={hasTrades ? t("dayTooltip", iso, fmt(entry.pnl), entry.count) : `${iso} · ${t("noTradeDay")}`}
              style={{
                aspectRatio: "1 / 1",
                borderRadius: 6,
                background,
                border: `1px solid ${borderColor}`,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "flex-end",
                padding: 4,
                cursor: hasTrades ? "default" : "auto",
                boxSizing: "border-box",
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 600, color: hasTrades ? "#0a0d14" : C.muted, opacity: hasTrades ? 0.9 : 0.7 }}>
                {day}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginTop: 14, fontSize: 11, color: C.muted }}>
        <LegendSwatch color={C.accent} label={t("profitDay")} />
        <LegendSwatch color={C.red} label={t("lossDay")} />
        <LegendSwatch color={C.bg} borderColor={C.border} label={t("noTradeDay")} />
      </div>
    </div>
  );
}

function LegendSwatch({ color, borderColor, label }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 12, height: 12, borderRadius: 3, background: color, border: `1px solid ${borderColor ?? color}` }} />
      {label}
    </span>
  );
}
