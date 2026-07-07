import { C } from "../constants";

export default function SectionTitle({ children }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
      <div style={{ width:3, height:18, background:C.accent, borderRadius:2 }} />
      <span style={{ fontSize:13, fontWeight:600, letterSpacing:1.5, textTransform:"uppercase", color:C.muted }}>{children}</span>
    </div>
  );
}
