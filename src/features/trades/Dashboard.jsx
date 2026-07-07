import { useEffect, useState } from "react";
import { loadTrades } from "../../loadTrades.js";
import { supabase } from "../../lib/supabaseClient";
import { stats } from "./stats";
import { C } from "./constants";
import { fmt, fmtPct } from "./format";
import Kpi from "./components/Kpi";
import EquityCurveChart from "./components/EquityCurveChart";
import PnlByDayChart from "./components/PnlByDayChart";
import PnlByAssetChart from "./components/PnlByAssetChart";
import WinLossPie from "./components/WinLossPie";
import LongShortBreakdown from "./components/LongShortBreakdown";
import TradeLogTable from "./components/TradeLogTable";

export default function Dashboard() {
  const [tab, setTab] = useState("all"); // all | p1 | p2
  const [excelData, setExcelData] = useState(null);

  useEffect(() => {
    loadTrades().then(setExcelData);
  }, []);

  if(!excelData) {
    return <div> loading...</div>
  }

  const portfolio1 = excelData.portfolio1;
  const portfolio2 = excelData.portfolio2;

  const s1 = stats(portfolio1);
  const s2 = stats(portfolio2);
  const allTrades = [...portfolio1, ...portfolio2]
  const sAll = stats(allTrades)

  const s = tab === "all" ? sAll : tab === "p1" ? s1 : s2;
  const trades = tab === "all" ? allTrades : tab === "p1" ? portfolio1 : portfolio2;

  return (
    <div style={{ background:C.bg, minHeight:"100vh", color:C.text, fontFamily:"'Inter', system-ui, sans-serif", padding:"24px 20px" }}>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
        <div>
          <div style={{ fontSize:11, letterSpacing:3, color:C.accent, textTransform:"uppercase", marginBottom:6 }}>Trading Journal</div>
          <h1 style={{ fontSize:26, fontWeight:800, margin:0, letterSpacing:-0.5 }}>Performance Dashboard</h1>
          <p style={{ fontSize:13, color:C.muted, margin:"4px 0 0" }}>May 21 – Jun 17, 2026 · Futures (MGC · MES · MNQ · MCL)</p>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          style={{ padding:"7px 14px", borderRadius:20, border:`1px solid ${C.border}`, background:"transparent", color:C.muted, fontSize:12, fontWeight:600, cursor:"pointer" }}
        >
          Sign out
        </button>
      </div>

      {/* Portfolio Tabs */}
      <div style={{ display:"flex", gap:8, marginBottom:24 }}>
        {[["all","All Trades"],["p1","Portfolio 1"],["p2","Portfolio 2"]].map(([key,label])=>(
          <button key={key} onClick={()=>setTab(key)} style={{
            padding:"7px 16px", borderRadius:20, border:`1px solid ${tab===key?C.accent:C.border}`,
            background: tab===key ? C.accentDim : "transparent",
            color: tab===key ? C.accent : C.muted,
            fontSize:12, fontWeight:600, cursor:"pointer", letterSpacing:0.5
          }}>{label}</button>
        ))}
      </div>

      {/* KPI Row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:12, marginBottom:24 }}>
        <Kpi label="Total P&L" value={fmt(s.totalPnl)} accent={s.totalPnl>=0?C.accent:C.red} />
        <Kpi label="Win Rate" value={fmtPct(s.winRate)} sub={`${s.wins}W · ${s.losses}L`} accent={s.winRate>=55?C.accent:C.gold} />
        <Kpi label="Avg Win" value={`$${Math.round(s.avgWin)}`} accent={C.accent} />
        <Kpi label="Avg Loss" value={`-$${Math.round(s.avgLoss)}`} accent={C.red} />
        <Kpi label="RRR" value={s.rrr.toFixed(2)} sub="reward:risk" accent={s.rrr>=1?C.accent:C.red} />
        <Kpi label="Best Streak" value={`${s.maxWin}W`} sub={`${s.maxLoss}L worst`} accent={C.gold} />
      </div>

      <EquityCurveChart equity={s.equity} />

      {/* P&L by Day + By Asset */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        <PnlByDayChart byDay={s.byDay} />
        <PnlByAssetChart byAsset={s.byAsset} />
      </div>

      {/* Win/Loss Pie + Long/Short */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        <WinLossPie wins={s.wins} losses={s.losses} avgWin={s.avgWin} avgLoss={s.avgLoss} />
        <LongShortBreakdown longs={s.longs} shorts={s.shorts} />
      </div>

      <TradeLogTable trades={trades} />

      <div style={{ textAlign:"center", marginTop:20, fontSize:11, color:C.muted }}>
        Portfolio 1: {portfolio1.length} trades · Portfolio 2: {portfolio2.length} trades · Combined: {allTrades.length} trades
      </div>
    </div>
  );
}
