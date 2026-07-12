import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { listPortfolios, createPortfolio, deletePortfolio } from "../portfolios/api";
import PortfolioTabs from "../portfolios/PortfolioTabs";
import { getTrades } from "./api/tradesApi";
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
import ImportFlow from "../csvImport/ImportFlow";
import LogTradeModal from "./LogTradeModal";
import { useLocale } from "../../lib/i18n/LocaleContext";
import LocaleToggle from "../shared/LocaleToggle";

export default function Dashboard() {
  const { t } = useLocale();
  const [portfolios, setPortfolios] = useState(null); // null = loading
  const [activeId, setActiveId] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [showLogTrade, setShowLogTrade] = useState(false);
  const [trades, setTrades] = useState(null); // null = loading, [] = loaded empty

  useEffect(() => {
    listPortfolios().then((rows) => {
      setPortfolios(rows);
      if (rows.length) setActiveId(rows[0].id);
    });
  }, []);

  useEffect(() => {
    if (!activeId) {
      setTrades([]);
      return;
    }
    setTrades(null);
    getTrades(activeId).then(setTrades);
  }, [activeId]);

  async function refreshTrades() {
    if (activeId) setTrades(await getTrades(activeId));
  }

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
    return <div style={{ background: C.bg, minHeight: "100vh", color: C.text }}>{t("loading")}</div>;
  }

  const activePortfolio = portfolios.find((p) => p.id === activeId) ?? null;
  const s = stats(trades ?? []);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "'Inter', system-ui, sans-serif", padding: "24px 20px" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 3, color: C.accent, textTransform: "uppercase", marginBottom: 6 }}>{t("tradingJournal")}</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>{t("performanceDashboard")}</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LocaleToggle />
          <button
            onClick={() => supabase.auth.signOut()}
            style={{ padding: "7px 14px", borderRadius: 20, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
          >
            {t("signOut")}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <PortfolioTabs
          portfolios={portfolios}
          activeId={activeId}
          onSelect={setActiveId}
          onCreate={handleCreate}
          onDelete={handleDelete}
        />
        {activePortfolio && (
          <div style={{ display: "flex", gap: 8 }}>
            {!showImport && (
              <button
                onClick={() => setShowImport(true)}
                style={{ padding: "7px 16px", borderRadius: 20, border: `1px solid ${C.accent}`, background: C.accentDim, color: C.accent, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
              >
                {t("importCsv")}
              </button>
            )}
            <button
              onClick={() => setShowLogTrade(true)}
              style={{ padding: "7px 16px", borderRadius: 20, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
            >
              {t("logTrade")}
            </button>
          </div>
        )}
      </div>

      {activePortfolio && showImport && (
        <ImportFlow portfolioId={activePortfolio.id} onClose={() => setShowImport(false)} onImported={refreshTrades} />
      )}

      {activePortfolio && showLogTrade && (
        <LogTradeModal
          portfolioId={activePortfolio.id}
          onClose={() => setShowLogTrade(false)}
          onSaved={() => {
            setShowLogTrade(false);
            refreshTrades();
          }}
        />
      )}

      {!activePortfolio ? (
        <EmptyState title={t("createFirstPortfolio")} subtitle={t("createFirstPortfolioSubtitle")} />
      ) : trades === null ? (
        <div style={{ color: C.muted, fontSize: 13 }}>{t("loadingTrades")}</div>
      ) : trades.length === 0 ? (
        <EmptyState title={t("noTradesYetIn", activePortfolio.name)} subtitle={t("noTradesYetSubtitle")} />
      ) : (
        <>
          {/* KPI Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 12, marginBottom: 24 }}>
            <Kpi label={t("totalPnl")} value={fmt(s.totalPnl)} accent={s.totalPnl >= 0 ? C.accent : C.red} />
            <Kpi label={t("winRate")} value={fmtPct(s.winRate)} sub={t("winsLossesShort", s.wins, s.losses)} accent={s.winRate >= 55 ? C.accent : C.gold} />
            <Kpi label={t("avgWin")} value={`$${Math.round(s.avgWin)}`} accent={C.accent} />
            <Kpi label={t("avgLoss")} value={`-$${Math.round(s.avgLoss)}`} accent={C.red} />
            <Kpi label={t("rrr")} value={s.rrr.toFixed(2)} sub={t("rewardRisk")} accent={s.rrr >= 1 ? C.accent : C.red} />
            <Kpi label={t("bestStreak")} value={`${s.maxWin}W`} sub={t("worstStreak", s.maxLoss)} accent={C.gold} />
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
            {activePortfolio.name}: {t("tradesSuffix", trades.length)}
          </div>
        </>
      )}
    </div>
  );
}
