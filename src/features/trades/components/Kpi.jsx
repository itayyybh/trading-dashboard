import { C } from "../constants";

export default function Kpi({ label, value, sub, accent }) {
  return (
    <div style={{ background: C.panel, border:`1px solid ${C.border}`, borderRadius:12, padding:"18px 20px" }}>
      <div style={{ fontSize:11, letterSpacing:2, color:C.muted, textTransform:"uppercase", marginBottom:6 }}>{label}</div>
      <div style={{ fontSize:28, fontWeight:700, color: accent || C.text, fontFamily:"'SF Mono', monospace" }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:C.muted, marginTop:4 }}>{sub}</div>}
    </div>
  );
}
