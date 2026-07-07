import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import { C } from "../constants";
import SectionTitle from "./SectionTitle";
import { useLocale } from "../../../lib/i18n/LocaleContext";

export default function EquityCurveChart({ equity }) {
  const { t } = useLocale();

  return (
    <div dir="ltr" style={{ background:C.panel, border:`1px solid ${C.border}`, borderRadius:12, padding:20, marginBottom:16 }}>
      <SectionTitle>{t("equityCurve")}</SectionTitle>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={equity}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
          <XAxis dataKey="i" tick={{ fill:C.muted, fontSize:10 }} label={{ value:t("tradeNumber"), position:"insideBottomRight", fill:C.muted, fontSize:10 }} />
          <YAxis tick={{ fill:C.muted, fontSize:10 }} tickFormatter={v=>`$${v}`} />
          <Tooltip contentStyle={{ background:C.panel, border:`1px solid ${C.border}`, borderRadius:8 }}
            formatter={v=>[`$${v}`, t("cumulativePnl")]} labelFormatter={l=>`${t("tradeNumber")} ${l}`} />
          <ReferenceLine y={0} stroke={C.muted} strokeDasharray="4 2" />
          <Line type="monotone" dataKey="value" stroke={C.accent} strokeWidth={2} dot={false} activeDot={{ r:4, fill:C.accent }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
