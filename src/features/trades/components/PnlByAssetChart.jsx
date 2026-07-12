import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import { C, ASSET_COLORS, font } from "../../../ui/theme";
import ChartCard from "../../../ui/ChartCard";
import { fmt } from "../format";
import { useLocale } from "../../../lib/i18n/LocaleContext";

export default function PnlByAssetChart({ byAsset }) {
  const { t } = useLocale();

  return (
    <ChartCard dir="ltr" title={t("pnlByAsset")}>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={byAsset} layout="vertical" margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.borderSoft} horizontal={false} />
          <XAxis type="number" tick={{ fill: C.muted, fontSize: 10, fontFamily: font.mono }} tickFormatter={(v) => `$${v}`} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fill: C.text, fontSize: 11 }} width={40} axisLine={false} tickLine={false} />
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
          <ReferenceLine x={0} stroke={C.border} />
          <Bar dataKey="pnl" radius={[0, 4, 4, 0]} maxBarSize={26}>
            {byAsset.map((d, i) => (
              <Cell key={i} fill={ASSET_COLORS[d.name] || C.accent} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
