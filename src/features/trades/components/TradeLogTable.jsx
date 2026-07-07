import { C, ASSET_COLORS } from "../constants";
import { fmt } from "../format";
import SectionTitle from "./SectionTitle";
import { useLocale } from "../../../lib/i18n/LocaleContext";

export default function TradeLogTable({ trades }) {
  const { t } = useLocale();
  const headers = [t("date"), t("entry"), t("exit"), t("dirShort"), t("asset"), t("pnl")];

  return (
    <div style={{ background:C.panel, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
      <SectionTitle>{t("tradeLog")}</SectionTitle>
      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead>
            <tr style={{ color:C.muted, textAlign:"left" }}>
              {headers.map(h=>(
                <th key={h} style={{ padding:"6px 10px", borderBottom:`1px solid ${C.border}`, fontWeight:500, letterSpacing:0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trades.map((tr,i)=>(
              <tr key={i} style={{ borderBottom:`1px solid ${C.border}20` }}>
                <td style={{ padding:"7px 10px", color:C.muted }}>{tr.date}</td>
                <td style={{ padding:"7px 10px" }}>{tr.entry}</td>
                <td style={{ padding:"7px 10px" }}>{tr.exit}</td>
                <td style={{ padding:"7px 10px" }}>
                  <span style={{ padding:"2px 8px", borderRadius:4, fontSize:10, fontWeight:600,
                    background: tr.dir==="Long"?`${C.accent}20`:`${C.gold}20`,
                    color: tr.dir==="Long"?C.accent:C.gold }}>
                    {tr.dir==="Long"?t("long"):t("short")}
                  </span>
                </td>
                <td style={{ padding:"7px 10px", color: ASSET_COLORS[tr.asset]||C.text, fontWeight:600 }}>{tr.asset}</td>
                <td style={{ padding:"7px 10px", fontFamily:"monospace", fontWeight:700,
                  color: tr.pnl>=0?C.accent:C.red }}>
                  {fmt(tr.pnl)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
