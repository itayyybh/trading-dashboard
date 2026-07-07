import { C } from "../constants";
import { fmt } from "../format";
import SectionTitle from "./SectionTitle";
import { useLocale } from "../../../lib/i18n/LocaleContext";

export default function LongShortBreakdown({ longs, shorts }) {
  const { t } = useLocale();

  return (
    <div style={{ background:C.panel, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
      <SectionTitle>{t("longVsShort")}</SectionTitle>
      {[
        ["Long", longs],
        ["Short", shorts],
      ].map(([dir, tr]) => {
        const wins = tr.filter(t=>t.pnl>0).length;
        const pnl = tr.reduce((s,t)=>s+t.pnl,0);
        const wr = tr.length ? (wins/tr.length*100).toFixed(0) : 0;
        return (
          <div key={dir} style={{ marginBottom:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
              <span style={{ fontSize:13, fontWeight:600 }}>{dir === "Long" ? t("long") : t("short")}</span>
              <span style={{ fontFamily:"monospace", fontSize:13, color:pnl>=0?C.accent:C.red }}>{fmt(pnl)}</span>
            </div>
            <div style={{ display:"flex", gap:12, fontSize:11, color:C.muted }}>
              <span>{t("tradesSuffix", tr.length)}</span>
              <span>{t("winRateSuffix", wr)}</span>
              <span>{wins}W · {tr.length-wins}L</span>
            </div>
            <div style={{ marginTop:6, height:4, background:C.border, borderRadius:2 }}>
              <div style={{ width:`${wr}%`, height:"100%", background: dir==="Long"?C.accent:C.gold, borderRadius:2 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
