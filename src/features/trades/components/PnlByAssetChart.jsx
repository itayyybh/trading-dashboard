import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import { C, ASSET_COLORS } from "../constants";
import { fmt } from "../format";
import SectionTitle from "./SectionTitle";

export default function PnlByAssetChart({ byAsset }) {
  return (
    <div style={{ background:C.panel, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
      <SectionTitle>P&L by Asset</SectionTitle>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={byAsset} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
          <XAxis type="number" tick={{ fill:C.muted, fontSize:10 }} tickFormatter={v=>`$${v}`} />
          <YAxis type="category" dataKey="name" tick={{ fill:C.text, fontSize:11 }} width={36} />
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
          <ReferenceLine x={0} stroke={C.muted} />
          <Bar dataKey="pnl" radius={[0,4,4,0]}>
            {byAsset.map((d,i)=><Cell key={i} fill={ASSET_COLORS[d.name]||C.accent} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
