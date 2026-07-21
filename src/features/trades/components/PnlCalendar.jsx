import { useMemo, useState } from "react";
import { C, font } from "../../../ui/theme";
import Section from "../../../ui/Section";
import { fmt } from "../format";
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

  // Trade days sorted ascending — the basis for the running (carry-forward)
  // balance. The daily balance is the cumulative equity through a given day,
  // matching how the equity curve sums P&L over time (starting from zero).
  const sortedDays = useMemo(
    () => [...byDay].sort((a, b) => (a.date < b.date ? -1 : 1)),
    [byDay]
  );
  function balanceAsOf(iso) {
    let running = 0;
    for (const d of sortedDays) {
      if (d.date <= iso) running += d.pnl;
      else break;
    }
    return running;
  }

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
    color: C.textDim,
    fontSize: 15,
    lineHeight: 1,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const header = (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: monthTotal >= 0 ? C.pos : C.red, fontFamily: font.mono, fontVariantNumeric: "tabular-nums" }}>
        {t("monthTotal", fmt(monthTotal))}
      </span>
      <button type="button" aria-label={t("prevMonth")} onClick={() => shiftMonth(-1)} style={navBtn}>‹</button>
      <span style={{ fontSize: 13, fontWeight: 700, minWidth: 128, textAlign: "center", color: C.text }}>
        {monthNames[view.month]} {view.year}
      </span>
      <button type="button" aria-label={t("nextMonth")} onClick={() => shiftMonth(1)} style={navBtn}>›</button>
    </div>
  );

  return (
    <Section dir="ltr" title={t("pnlCalendar")} right={header}>
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
          const weekday = new Date(view.year, view.month, day).getDay();
          const dateLabel = `${weekdayNames[weekday]}, ${monthNames[view.month]} ${day}`;

          return (
            <DayCell
              key={iso}
              day={day}
              dateLabel={dateLabel}
              entry={entry}
              balance={balanceAsOf(iso)}
              monthMaxAbs={monthMaxAbs}
              t={t}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginTop: 16, fontSize: 11, color: C.muted }}>
        <LegendSwatch color={C.pos} label={t("profitDay")} />
        <LegendSwatch color={C.red} label={t("lossDay")} />
        <LegendSwatch color={C.bgElevated} borderColor={C.borderSoft} label={t("noTradeDay")} />
      </div>
    </Section>
  );
}

// A single day cube. Owns its hover state so exactly one styled tooltip shows at
// a time; the tooltip leads with the running daily balance, then the day's P&L.
function DayCell({ day, dateLabel, entry, balance, monthMaxAbs, t }) {
  const [hover, setHover] = useState(false);
  const hasTrades = !!entry;
  const profit = hasTrades && entry.pnl >= 0;

  let background = C.bgElevated;
  let borderColor = C.borderSoft;
  if (hasTrades) {
    const intensity = monthMaxAbs > 0 ? 0.35 + 0.65 * (Math.abs(entry.pnl) / monthMaxAbs) : 0.7;
    const base = profit ? C.pos : C.red;
    background = base + Math.round(intensity * 255).toString(16).padStart(2, "0");
    borderColor = base;
  }

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        tabIndex={0}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        aria-label={`${dateLabel}. ${t("calBalance")} ${fmt(balance)}${hasTrades ? `. ${t("calDayPnl")} ${fmt(entry.pnl)}, ${t("calTradeCount", entry.count)}` : `. ${t("noTradeDay")}`}`}
        style={{
          aspectRatio: "1 / 1",
          borderRadius: 7,
          background,
          border: `1px solid ${hover ? (hasTrades ? borderColor : C.border) : borderColor}`,
          boxShadow: hover ? `0 0 0 2px ${(hasTrades ? borderColor : C.brand)}33` : "none",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          padding: 4,
          cursor: "default",
          boxSizing: "border-box",
          transition: "box-shadow 120ms, border-color 120ms",
          outline: "none",
        }}
      >
        <span style={{ fontSize: 10, fontWeight: 600, color: hasTrades ? "#04120e" : C.muted, opacity: hasTrades ? 0.9 : 0.7 }}>
          {day}
        </span>
      </div>

      {hover && (
        <DayTooltip dateLabel={dateLabel} entry={entry} balance={balance} hasTrades={hasTrades} profit={profit} t={t} />
      )}
    </div>
  );
}

// Floating tooltip anchored above the hovered cell. pointer-events:none so it
// never steals the hover; it sits outside the (non-clipping) card so top-row
// cells aren't cut off.
function DayTooltip({ dateLabel, entry, balance, hasTrades, profit, t }) {
  const row = { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16 };
  const rowLabel = { fontSize: 10.5, color: C.muted, letterSpacing: 0.2 };
  const rowValue = { fontFamily: font.mono, fontVariantNumeric: "tabular-nums", fontSize: 12.5, fontWeight: 700 };

  return (
    <div
      role="tooltip"
      style={{
        position: "absolute",
        bottom: "calc(100% + 8px)",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 15,
        minWidth: 150,
        pointerEvents: "none",
        background: C.panel2,
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        boxShadow: "0 18px 40px -18px rgba(0,0,0,0.85)",
        padding: "10px 12px",
        animation: "dash-tip-in 120ms cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 8, whiteSpace: "nowrap" }}>
        {dateLabel}
      </div>

      <div style={{ ...row, marginBottom: hasTrades ? 5 : 0 }}>
        <span style={rowLabel}>{t("calBalance")}</span>
        <span style={{ ...rowValue, color: balance >= 0 ? C.pos : C.red }}>{fmt(balance)}</span>
      </div>

      {hasTrades ? (
        <>
          <div style={row}>
            <span style={rowLabel}>{t("calDayPnl")}</span>
            <span style={{ ...rowValue, color: profit ? C.pos : C.red }}>{fmt(entry.pnl)}</span>
          </div>
          <div style={{ fontSize: 10.5, color: C.muted, marginTop: 6 }}>
            {t("calTradeCount", entry.count)}
          </div>
        </>
      ) : (
        <div style={{ fontSize: 10.5, color: C.muted, marginTop: 2 }}>{t("noTradeDay")}</div>
      )}

      {/* caret */}
      <span
        style={{
          position: "absolute",
          top: "100%",
          left: "50%",
          transform: "translateX(-50%) rotate(45deg)",
          marginTop: -4,
          width: 8,
          height: 8,
          background: C.panel2,
          borderRight: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
        }}
      />
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
