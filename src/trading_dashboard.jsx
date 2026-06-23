
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import { useEffect, useState } from "react";
import { loadTrades } from "./loadTrades.js";


// ── Raw trade data parsed from journal ──────────────────────────────────────


// ── Helpers ──────────────────────────────────────────────────────────────────
function stats(trades) {
  const wins = trades.filter(t => t.pnl > 0);
  const losses = trades.filter(t => t.pnl < 0);
  const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
  const avgWin = wins.length ? wins.reduce((s,t)=>s+t.pnl,0)/wins.length : 0;
  const avgLoss = losses.length ? Math.abs(losses.reduce((s,t)=>s+t.pnl,0)/losses.length) : 0;
  const rrr = avgLoss ? avgWin/avgLoss : 0;
  const winRate = trades.length ? (wins.length/trades.length)*100 : 0;

  // equity curve
  let running = 0;
  const equity = trades.map((t,i) => { running += t.pnl; return { i: i+1, value: running }; });

  // by asset
  const assetMap = {};
  trades.forEach(t => {
    if (!assetMap[t.asset]) assetMap[t.asset] = { pnl: 0, count: 0 };
    assetMap[t.asset].pnl += t.pnl;
    assetMap[t.asset].count += 1;
  });
  const byAsset = Object.entries(assetMap).map(([name,v])=>({ name, ...v }));

  // by direction
  const longs  = trades.filter(t=>t.dir==="Long");
  const shorts = trades.filter(t=>t.dir==="Short");

  // by day PnL
  const dayMap = {};
  trades.forEach(t => {
    dayMap[t.date] = (dayMap[t.date]||0)+t.pnl;
  });
  const byDay = Object.entries(dayMap).map(([date,pnl])=>({ date, pnl }));

  // win/loss streak
  let maxWin=0, maxLoss=0, curWin=0, curLoss=0;
  trades.forEach(t => {
    if (t.pnl>0){ curWin++; curLoss=0; maxWin=Math.max(maxWin,curWin); }
    else { curLoss++; curWin=0; maxLoss=Math.max(maxLoss,curLoss); }
  });

  return { wins:wins.length, losses:losses.length, totalPnl, avgWin, avgLoss, rrr, winRate,
    equity, byAsset, byDay, longs, shorts, maxWin, maxLoss };
}


// ── Colors ───────────────────────────────────────────────────────────────────
const C = {
  bg: "#0a0d14",
  panel: "#10141f",
  border: "#1e2535",
  accent: "#00e5b4",
  accentDim: "#00e5b430",
  red: "#ff4d6d",
  redDim: "#ff4d6d25",
  gold: "#f5c842",
  text: "#e2e8f0",
  muted: "#64748b",
  p1: "#00e5b4",
  p2: "#818cf8",
};

const ASSET_COLORS = { MGC: C.gold, MES: "#60a5fa", MNQ: "#c084fc", MCL: "#fb923c" };

// ── Sub-components ───────────────────────────────────────────────────────────
function Kpi({ label, value, sub, accent }) {
  return (
    <div style={{ background: C.panel, border:`1px solid ${C.border}`, borderRadius:12, padding:"18px 20px" }}>
      <div style={{ fontSize:11, letterSpacing:2, color:C.muted, textTransform:"uppercase", marginBottom:6 }}>{label}</div>
      <div style={{ fontSize:28, fontWeight:700, color: accent || C.text, fontFamily:"'SF Mono', monospace" }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:C.muted, marginTop:4 }}>{sub}</div>}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
      <div style={{ width:3, height:18, background:C.accent, borderRadius:2 }} />
      <span style={{ fontSize:13, fontWeight:600, letterSpacing:1.5, textTransform:"uppercase", color:C.muted }}>{children}</span>
    </div>
  );
}

const fmt = n => (n>=0?"+":"")+`$${Math.abs(n).toLocaleString()}`;
const fmtPct = n => n.toFixed(1)+"%";

// ── Main Dashboard ────────────────────────────────────────────────────────────
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

  const pieData = [
    { name: "Wins", value: s.wins },
    { name: "Losses", value: s.losses },
  ];
  
  return (
    <div style={{ background:C.bg, minHeight:"100vh", color:C.text, fontFamily:"'Inter', system-ui, sans-serif", padding:"24px 20px" }}>

      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:11, letterSpacing:3, color:C.accent, textTransform:"uppercase", marginBottom:6 }}>Trading Journal</div>
        <h1 style={{ fontSize:26, fontWeight:800, margin:0, letterSpacing:-0.5 }}>Performance Dashboard</h1>
        <p style={{ fontSize:13, color:C.muted, margin:"4px 0 0" }}>May 21 – Jun 17, 2026 · Futures (MGC · MES · MNQ · MCL)</p>
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

      {/* Equity Curve */}
      <div style={{ background:C.panel, border:`1px solid ${C.border}`, borderRadius:12, padding:20, marginBottom:16 }}>
        <SectionTitle>Equity Curve</SectionTitle>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={s.equity}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="i" tick={{ fill:C.muted, fontSize:10 }} label={{ value:"Trade #", position:"insideBottomRight", fill:C.muted, fontSize:10 }} />
            <YAxis tick={{ fill:C.muted, fontSize:10 }} tickFormatter={v=>`$${v}`} />
            <Tooltip contentStyle={{ background:C.panel, border:`1px solid ${C.border}`, borderRadius:8 }}
              formatter={v=>[`$${v}`, "Cumulative P&L"]} labelFormatter={l=>`Trade #${l}`} />
            <ReferenceLine y={0} stroke={C.muted} strokeDasharray="4 2" />
            <Line type="monotone" dataKey="value" stroke={C.accent} strokeWidth={2} dot={false} activeDot={{ r:4, fill:C.accent }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* P&L by Day + By Asset */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        <div style={{ background:C.panel, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
          <SectionTitle>P&L by Day</SectionTitle>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={s.byDay}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="date" tick={{ fill:C.muted, fontSize:8 }} angle={-35} textAnchor="end" height={40} />
              <YAxis tick={{ fill:C.muted, fontSize:10 }} tickFormatter={v=>`$${v}`} />
              <Tooltip
                contentStyle={{
                  background: C.panel,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                }}
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
                {s.byDay.map((d,i)=><Cell key={i} fill={d.pnl>=0?C.accent:C.red} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background:C.panel, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
          <SectionTitle>P&L by Asset</SectionTitle>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={s.byAsset} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis type="number" tick={{ fill:C.muted, fontSize:10 }} tickFormatter={v=>`$${v}`} />
              <YAxis type="category" dataKey="name" tick={{ fill:C.text, fontSize:11 }} width={36} />
              <Tooltip
                contentStyle={{
                  background: C.panel,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                }}
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
                {s.byAsset.map((d,i)=><Cell key={i} fill={ASSET_COLORS[d.name]||C.accent} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Win/Loss Pie + Long/Short */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
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
              {[["Wins", s.wins, C.accent],["Losses", s.losses, C.red]].map(([label,val,color])=>(
                <div key={label} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:`1px solid ${C.border}` }}>
                  <span style={{ color:C.muted, fontSize:13 }}>{label}</span>
                  <span style={{ color, fontWeight:700, fontFamily:"monospace" }}>{val}</span>
                </div>
              ))}
              <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 0" }}>
                <span style={{ color:C.muted, fontSize:13 }}>Profit Factor</span>
                <span style={{ color:C.gold, fontWeight:700, fontFamily:"monospace" }}>
                  {s.losses>0 ? (s.wins*s.avgWin/(s.losses*s.avgLoss)).toFixed(2) : "∞"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ background:C.panel, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
          <SectionTitle>Long vs Short</SectionTitle>
          {[
            ["Long", s.longs],
            ["Short", s.shorts],
          ].map(([dir, tr]) => {
            const wins = tr.filter(t=>t.pnl>0).length;
            const pnl = tr.reduce((s,t)=>s+t.pnl,0);
            const wr = tr.length ? (wins/tr.length*100).toFixed(0) : 0;
            return (
              <div key={dir} style={{ marginBottom:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ fontSize:13, fontWeight:600 }}>{dir}</span>
                  <span style={{ fontFamily:"monospace", fontSize:13, color:pnl>=0?C.accent:C.red }}>{fmt(pnl)}</span>
                </div>
                <div style={{ display:"flex", gap:12, fontSize:11, color:C.muted }}>
                  <span>{tr.length} trades</span>
                  <span>{wr}% win rate</span>
                  <span>{wins}W · {tr.length-wins}L</span>
                </div>
                <div style={{ marginTop:6, height:4, background:C.border, borderRadius:2 }}>
                  <div style={{ width:`${wr}%`, height:"100%", background: dir==="Long"?C.accent:C.gold, borderRadius:2 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trade Log */}
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

      <div style={{ textAlign:"center", marginTop:20, fontSize:11, color:C.muted }}>
        Portfolio 1: {portfolio1.length} trades · Portfolio 2: {portfolio2.length} trades · Combined: {allTrades.length} trades
      </div>
    </div>
  );
}


