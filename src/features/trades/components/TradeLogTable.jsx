import { C, ASSET_COLORS } from "../constants";
import { fmt } from "../format";
import SectionTitle from "./SectionTitle";

export default function TradeLogTable({ trades }) {
  return (
    <div style={{ background:C.panel, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
      <SectionTitle>Trade Log</SectionTitle>
      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead>
            <tr style={{ color:C.muted, textAlign:"left" }}>
              {["Date","Entry","Exit","Dir","Asset","P&L"].map(h=>(
                <th key={h} style={{ padding:"6px 10px", borderBottom:`1px solid ${C.border}`, fontWeight:500, letterSpacing:0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trades.map((t,i)=>(
              <tr key={i} style={{ borderBottom:`1px solid ${C.border}20` }}>
                <td style={{ padding:"7px 10px", color:C.muted }}>{t.date}</td>
                <td style={{ padding:"7px 10px" }}>{t.entry}</td>
                <td style={{ padding:"7px 10px" }}>{t.exit}</td>
                <td style={{ padding:"7px 10px" }}>
                  <span style={{ padding:"2px 8px", borderRadius:4, fontSize:10, fontWeight:600,
                    background: t.dir==="Long"?`${C.accent}20`:`${C.gold}20`,
                    color: t.dir==="Long"?C.accent:C.gold }}>
                    {t.dir}
                  </span>
                </td>
                <td style={{ padding:"7px 10px", color: ASSET_COLORS[t.asset]||C.text, fontWeight:600 }}>{t.asset}</td>
                <td style={{ padding:"7px 10px", fontFamily:"monospace", fontWeight:700,
                  color: t.pnl>=0?C.accent:C.red }}>
                  {fmt(t.pnl)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
