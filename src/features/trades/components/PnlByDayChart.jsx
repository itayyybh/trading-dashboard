import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import { C, font } from "../../../ui/theme";
import ChartCard from "../../../ui/ChartCard";
import { fmt } from "../format";
import { useLocale } from "../../../lib/i18n/LocaleContext";

export default function PnlByDayChart({ byDay }) {
  const { t } = useLocale();

  return (
    <ChartCard dir="ltr" title={t("pnlByDay")}>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={byDay} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.borderSoft} vertical={false} />
          <XAxis dataKey="date" tick={{ fill: C.muted, fontSize: 8 }} angle={-35} textAnchor="end" height={40} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: C.muted, fontSize: 10, fontFamily: font.mono }} tickFormatter={(v) => `$${v}`} axisLine={false} tickLine={false} width={52} />
          <Tooltip
            cursor={{ fill: C.accentSoft }}
            contentStyle={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 10 }}
            labelStyle={{ color: C.muted }}
            formatter={(value) => [
              <span style={{ color: value >= 0 ? C.accent : C.red, fontWeight: 700, fontFamily: font.mono }}>
                {fmt(value)}
              </span>,
            ]}
          />
          <ReferenceLine y={0} stroke={C.border} />
          <Bar dataKey="pnl" radius={[3, 3, 0, 0]} maxBarSize={28}>
            {byDay.map((d, i) => (
              <Cell key={i} fill={d.pnl >= 0 ? C.accent : C.red} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
