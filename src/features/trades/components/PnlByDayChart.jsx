import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import { C } from "../constants";
import { fmt } from "../format";
import SectionTitle from "./SectionTitle";
import { useLocale } from "../../../lib/i18n/LocaleContext";

export default function PnlByDayChart({ byDay }) {
  const { t } = useLocale();

  return (
    <div dir="ltr" style={{ background:C.panel, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
      <SectionTitle>{t("pnlByDay")}</SectionTitle>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={byDay}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
          <XAxis dataKey="date" tick={{ fill:C.muted, fontSize:8 }} angle={-35} textAnchor="end" height={40} />
          <YAxis tick={{ fill:C.muted, fontSize:10 }} tickFormatter={v=>`$${v}`} />
          <Tooltip
            cursor={{ fill: C.border, fillOpacity: 0.3 }}
            contentStyle={{
              background: C.panel,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
            }}
            labelStyle={{ color: C.text }}
            formatter={(value) => [
              <span
                style={{
                  color: value >= 0 ? C.accent : C.red,
                  fontWeight: 700,
                }}
              >
                {fmt(value)}
              </span>,
            ]}
          />
          <ReferenceLine y={0} stroke={C.muted} />
          <Bar dataKey="pnl" radius={[3,3,0,0]}>
            {byDay.map((d,i)=><Cell key={i} fill={d.pnl>=0?C.accent:C.red} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
