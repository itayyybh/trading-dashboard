import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import { C, font } from "../../../ui/theme";
import ChartCard from "../../../ui/ChartCard";
import { fmt } from "../format";
import { useLocale } from "../../../lib/i18n/LocaleContext";

// Fraction (0..1, from the top) of the value range that sits above zero. Used as
// the gradient split point so the curve is green above the zero line and red
// below it — even when equity dips negative and crosses back.
function zeroOffset(equity) {
  const values = equity.map((e) => e.value);
  if (!values.length) return 1;
  const max = Math.max(...values);
  const min = Math.min(...values);
  if (max <= 0) return 0; // entirely underwater → all red
  if (min >= 0) return 1; // never underwater → all green
  return max / (max - min);
}

function EquityTooltip({ active, payload, label, t }) {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  return (
    <div style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 11px", boxShadow: "0 18px 40px -18px rgba(0,0,0,0.85)" }}>
      <div style={{ color: C.muted, fontSize: 11, marginBottom: 4 }}>{t("tradeNumber")} {label}</div>
      <div style={{ color: v >= 0 ? C.pos : C.red, fontWeight: 700, fontFamily: font.mono, fontVariantNumeric: "tabular-nums", fontSize: 13 }}>
        {fmt(v)}
      </div>
    </div>
  );
}

export default function EquityCurveChart({ equity }) {
  const { t } = useLocale();
  const off = zeroOffset(equity);

  return (
    <ChartCard dir="ltr" title={t("equityCurve")} style={{ marginBottom: 16 }}>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={equity} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
          <defs>
            {/* Hard color split at the zero line for the stroke... */}
            <linearGradient id="equityStroke" x1="0" y1="0" x2="0" y2="1">
              <stop offset={off} stopColor={C.pos} />
              <stop offset={off} stopColor={C.red} />
            </linearGradient>
            {/* ...and a fade that's strongest at the extremes for the fill. */}
            <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.pos} stopOpacity={0.28} />
              <stop offset={off} stopColor={C.pos} stopOpacity={0.04} />
              <stop offset={off} stopColor={C.red} stopOpacity={0.04} />
              <stop offset="100%" stopColor={C.red} stopOpacity={0.28} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={C.borderSoft} vertical={false} />
          <XAxis dataKey="i" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fill: C.muted, fontSize: 10, fontFamily: font.mono }}
            tickFormatter={(v) => `$${v}`}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip content={<EquityTooltip t={t} />} cursor={{ stroke: C.border }} />
          <ReferenceLine y={0} stroke={C.border} strokeDasharray="4 2" />
          <Area
            type="monotone"
            dataKey="value"
            stroke="url(#equityStroke)"
            strokeWidth={2}
            fill="url(#equityFill)"
            dot={false}
            activeDot={(props) => {
              const { cx, cy, payload } = props;
              return (
                <circle cx={cx} cy={cy} r={4} fill={payload.value >= 0 ? C.pos : C.red} stroke={C.bg} strokeWidth={2} />
              );
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
