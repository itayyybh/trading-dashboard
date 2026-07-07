import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { C } from "../constants";
import SectionTitle from "./SectionTitle";

export default function WinLossPie({ wins, losses, avgWin, avgLoss }) {
  const pieData = [
    { name: "Wins", value: wins },
    { name: "Losses", value: losses },
  ];

  return (
    <div style={{ background:C.panel, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
      <SectionTitle>Win / Loss Split</SectionTitle>
      <div style={{ display:"flex", alignItems:"center", gap:20 }}>
        <ResponsiveContainer width={110} height={110}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" innerRadius={28} outerRadius={48} dataKey="value" startAngle={90} endAngle={-270}>
              <Cell fill={C.accent} />
              <Cell fill={C.red} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div style={{ flex:1 }}>
          {[["Wins", wins, C.accent],["Losses", losses, C.red]].map(([label,val,color])=>(
            <div key={label} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:`1px solid ${C.border}` }}>
              <span style={{ color:C.muted, fontSize:13 }}>{label}</span>
              <span style={{ color, fontWeight:700, fontFamily:"monospace" }}>{val}</span>
            </div>
          ))}
          <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 0" }}>
            <span style={{ color:C.muted, fontSize:13 }}>Profit Factor</span>
            <span style={{ color:C.gold, fontWeight:700, fontFamily:"monospace" }}>
              {losses>0 ? (wins*avgWin/(losses*avgLoss)).toFixed(2) : "∞"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
