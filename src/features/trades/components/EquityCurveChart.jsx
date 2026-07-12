import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import { C, font } from "../../../ui/theme";
import ChartCard from "../../../ui/ChartCard";
import { useLocale } from "../../../lib/i18n/LocaleContext";

const tooltipStyle = {
  background: C.panel2,
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  fontFamily: font.mono,
  fontSize: 12,
};

export default function EquityCurveChart({ equity }) {
  const { t } = useLocale();

  return (
    <ChartCard dir="ltr" title={t("equityCurve")} style={{ marginBottom: 16 }}>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={equity} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.accent} stopOpacity={0.28} />
              <stop offset="100%" stopColor={C.accent} stopOpacity={0} />
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
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={{ color: C.muted }}
            itemStyle={{ color: C.accent, fontWeight: 700 }}
            formatter={(v) => [`$${v}`, t("cumulativePnl")]}
            labelFormatter={(l) => `${t("tradeNumber")} ${l}`}
          />
          <ReferenceLine y={0} stroke={C.border} strokeDasharray="4 2" />
          <Area
            type="monotone"
            dataKey="value"
            stroke={C.accent}
            strokeWidth={2}
            fill="url(#equityFill)"
            dot={false}
            activeDot={{ r: 4, fill: C.accent, stroke: C.bg, strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
