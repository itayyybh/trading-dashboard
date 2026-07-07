import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { listPortfolios, createPortfolio, deletePortfolio } from "../portfolios/api";
import PortfolioTabs from "../portfolios/PortfolioTabs";
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
import EmptyState from "./components/EmptyState";

export default function Dashboard() {
  const [portfolios, setPortfolios] = useState(null); // null = loading
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    listPortfolios().then((rows) => {
      setPortfolios(rows);
      if (rows.length) setActiveId(rows[0].id);
    });
  }, []);

  async function handleCreate(name) {
    const created = await createPortfolio(name);
    setPortfolios((prev) => [...prev, created]);
    setActiveId(created.id);
  }

  async function handleDelete(id) {
    await deletePortfolio(id);
    setPortfolios((prev) => {
      const next = prev.filter((p) => p.id !== id);
      setActiveId((current) => (current === id ? next[0]?.id ?? null : current));
      return next;
    });
  }

  if (portfolios === null) {
    return <div style={{ background: C.bg, minHeight: "100vh", color: C.text }}>loading...</div>;
  }

  const activePortfolio = portfolios.find((p) => p.id === activeId) ?? null;
  const trades = []; // trades will come from Supabase in a later phase
  const s = stats(trades);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "'Inter', system-ui, sans-serif", padding: "24px 20px" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 3, color: C.accent, textTransform: "uppercase", marginBottom: 6 }}>Trading Journal</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>Performance Dashboard</h1>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          style={{ padding: "7px 14px", borderRadius: 20, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
        >
          Sign out
        </button>
      </div>

      <PortfolioTabs
        portfolios={portfolios}
        activeId={activeId}
        onSelect={setActiveId}
        onCreate={handleCreate}
        onDelete={handleDelete}
      />

      {!activePortfolio ? (
        <EmptyState title="Create your first portfolio" subtitle="Use “+ New portfolio” above to get started." />
      ) : trades.length === 0 ? (
        <EmptyState title={`No trades yet in ${activePortfolio.name}`} subtitle="CSV upload is coming in the next phase." />
      ) : (
        <>
          {/* KPI Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 12, marginBottom: 24 }}>
            <Kpi label="Total P&L" value={fmt(s.totalPnl)} accent={s.totalPnl >= 0 ? C.accent : C.red} />
            <Kpi label="Win Rate" value={fmtPct(s.winRate)} sub={`${s.wins}W · ${s.losses}L`} accent={s.winRate >= 55 ? C.accent : C.gold} />
            <Kpi label="Avg Win" value={`$${Math.round(s.avgWin)}`} accent={C.accent} />
            <Kpi label="Avg Loss" value={`-$${Math.round(s.avgLoss)}`} accent={C.red} />
            <Kpi label="RRR" value={s.rrr.toFixed(2)} sub="reward:risk" accent={s.rrr >= 1 ? C.accent : C.red} />
            <Kpi label="Best Streak" value={`${s.maxWin}W`} sub={`${s.maxLoss}L worst`} accent={C.gold} />
          </div>

          <EquityCurveChart equity={s.equity} />

          {/* P&L by Day + By Asset */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <PnlByDayChart byDay={s.byDay} />
            <PnlByAssetChart byAsset={s.byAsset} />
          </div>

          {/* Win/Loss Pie + Long/Short */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <WinLossPie wins={s.wins} losses={s.losses} avgWin={s.avgWin} avgLoss={s.avgLoss} />
            <LongShortBreakdown longs={s.longs} shorts={s.shorts} />
          </div>

          <TradeLogTable trades={trades} />

          <div style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: C.muted }}>
            {activePortfolio.name}: {trades.length} trades
          </div>
        </>
      )}
    </div>
  );
}
