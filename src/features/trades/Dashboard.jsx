import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { listPortfolios, createPortfolio, deletePortfolio } from "../portfolios/api";
import PortfolioTabs from "../portfolios/PortfolioTabs";
import { getTrades } from "./api/tradesApi";
import { stats } from "./stats";
import { C } from "./constants";
import { fmt, fmtPct } from "./format";
import EquityCurveChart from "./components/EquityCurveChart";
import PnlCalendar from "./components/PnlCalendar";
import PnlByDayChart from "./components/PnlByDayChart";
import PnlByAssetChart from "./components/PnlByAssetChart";
import WinLossPie from "./components/WinLossPie";
import LongShortBreakdown from "./components/LongShortBreakdown";
import TradeLogTable from "./components/TradeLogTable";
import ImportFlow from "../csvImport/ImportFlow";
import LogTradeModal from "./LogTradeModal";
import { useLocale } from "../../lib/i18n/LocaleContext";
import LocaleToggle from "../shared/LocaleToggle";
import AppShell from "../../ui/AppShell";
import MetricCard from "../../ui/MetricCard";
import EmptyState from "../../ui/EmptyState";
import Button from "../../ui/Button";
import Section from "../../ui/Section";
import { type, space } from "../../ui/theme";

// The dashboard reads as a sequence of narrative beats (overview -> equity ->
// activity -> strengths/weaknesses -> detail -> journal), not a grid of
// interchangeable widgets — so beats are separated by whitespace
// (`space.section`) rather than each getting its own boxed container.
const narrativeGap = { marginBottom: space.section };
const twoCol = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 };
const kpiDivider = { width: 1, alignSelf: "stretch", background: C.borderSoft, minHeight: 40 };

export default function Dashboard() {
  const { t } = useLocale();
  const [portfolios, setPortfolios] = useState(null); // null = loading
  const [activeId, setActiveId] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [showLogTrade, setShowLogTrade] = useState(false);
  const [editingTrade, setEditingTrade] = useState(null);
  const [trades, setTrades] = useState(null); // null = loading, [] = loaded empty
  const [error, setError] = useState(null);

  useEffect(() => {
    listPortfolios()
      .then((rows) => {
        setPortfolios(rows);
        if (rows.length) setActiveId(rows[0].id);
      })
      .catch((e) => {
        setPortfolios([]);
        setError(e.message);
      });
  }, []);

  useEffect(() => {
    if (!activeId) {
      setTrades([]);
      return;
    }
    setTrades(null);
    setError(null);
    getTrades(activeId)
      .then(setTrades)
      .catch((e) => {
        setTrades([]);
        setError(e.message);
      });
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

  const topRight = (
    <>
      <LocaleToggle />
      <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()}>
        {t("signOut")}
      </Button>
    </>
  );

  // First paint, before portfolios resolve.
  if (portfolios === null) {
    return (
      <AppShell topRight={topRight}>
        <EmptyState variant="loading" title={t("loading")} />
      </AppShell>
    );
  }

  const activePortfolio = portfolios.find((p) => p.id === activeId) ?? null;
  const s = stats(trades ?? []);

  return (
    <AppShell topRight={topRight}>
      {/* Page heading */}
      <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 20px", letterSpacing: "-0.03em", color: C.text }}>
        {t("performanceDashboard")}
      </h1>

      {/* Toolbar: portfolio tabs + primary actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
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
              <Button variant="primary" size="sm" icon="↑" onClick={() => setShowImport(true)}>
                {t("importCsv")}
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => setShowLogTrade(true)}>
              {t("logTrade")}
            </Button>
          </div>
        )}
      </div>

      {activePortfolio && showImport && (
        <div style={{ marginBottom: 16 }}>
          <ImportFlow portfolioId={activePortfolio.id} onClose={() => setShowImport(false)} onImported={refreshTrades} />
        </div>
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

      {activePortfolio && editingTrade && (
        <LogTradeModal
          portfolioId={activePortfolio.id}
          trade={editingTrade}
          onClose={() => setEditingTrade(null)}
          onSaved={() => {
            setEditingTrade(null);
            refreshTrades();
          }}
        />
      )}

      {/* State machine: no portfolio → error → loading → empty → data */}
      {!activePortfolio ? (
        <EmptyState
          title={t("createFirstPortfolio")}
          subtitle={t("createFirstPortfolioSubtitle")}
        />
      ) : error ? (
        <EmptyState variant="error" title={t("somethingWentWrong")} subtitle={error} />
      ) : trades === null ? (
        <EmptyState variant="loading" title={t("loadingTrades")} />
      ) : trades.length === 0 ? (
        <EmptyState
          title={t("noTradesYetIn", activePortfolio.name)}
          subtitle={t("noTradesYetSubtitle")}
          action={
            <Button variant="primary" size="sm" icon="↑" onClick={() => setShowImport(true)}>
              {t("importCsv")}
            </Button>
          }
        />
      ) : (
        <>
          {/* 1. Performance Overview — one hero number, the rest secondary */}
          <div style={narrativeGap}>
            <div style={type.sectionHeader}>{t("performanceOverview")}</div>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 28, marginTop: space.lg }}>
              <MetricCard
                size="hero"
                label={t("totalPnl")}
                value={fmt(s.totalPnl)}
                accent={s.totalPnl >= 0 ? C.accent : C.red}
              />
              <div style={kpiDivider} />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 28, flex: 1, minWidth: 0 }}>
                <MetricCard label={t("winRate")} value={fmtPct(s.winRate)} sub={t("winsLossesShort", s.wins, s.losses)} accent={s.winRate >= 55 ? C.accent : C.gold} />
                <MetricCard label={t("avgWin")} value={`$${Math.round(s.avgWin)}`} accent={C.accent} />
                <MetricCard label={t("avgLoss")} value={`-$${Math.round(s.avgLoss)}`} accent={C.red} />
                <MetricCard label={t("rrr")} value={s.rrr.toFixed(2)} sub={t("rewardRisk")} accent={s.rrr >= 1 ? C.accent : C.red} />
                <MetricCard label={t("bestStreak")} value={`${s.maxWin}W`} sub={t("worstStreak", s.maxLoss)} accent={C.gold} />
              </div>
            </div>
          </div>

          {/* 2. Equity Progress — the hero chart, the most room, the least chrome */}
          <div style={narrativeGap}>
            <div style={type.sectionHeader}>{t("equityProgress")}</div>
            <div style={{ marginTop: space.lg }}>
              <EquityCurveChart equity={s.equity} />
            </div>
          </div>

          {/* 3. Trading Activity */}
          <div style={narrativeGap}>
            <div style={type.sectionHeader}>{t("tradingActivity")}</div>
            <div style={{ marginTop: space.lg }}>
              <PnlCalendar byDay={s.byDay} />
            </div>
          </div>

          {/* 4. Strengths & Weaknesses — framed as one insight, not two loose charts */}
          <div style={narrativeGap}>
            <div style={type.sectionHeader}>{t("strengthsWeaknesses")}</div>
            <div style={{ fontSize: 12.5, color: C.muted, marginTop: 4 }}>{t("winsLossesShort", s.wins, s.losses)}</div>
            <div style={{ ...twoCol, marginTop: space.lg }}>
              <WinLossPie wins={s.wins} losses={s.losses} avgWin={s.avgWin} avgLoss={s.avgLoss} />
              <LongShortBreakdown longs={s.longs} shorts={s.shorts} />
            </div>
          </div>

          {/* 5. Detailed Analytics — exploratory, collapsed by default */}
          <Section title={t("detailedAnalytics")} tier="section" collapsible defaultCollapsed style={narrativeGap}>
            <div style={twoCol}>
              <PnlByDayChart byDay={s.byDay} />
              <PnlByAssetChart byAsset={s.byAsset} />
            </div>
          </Section>

          {/* 6. Trade Journal — the one section that earns a card */}
          <TradeLogTable trades={trades} onEdit={setEditingTrade} />
        </>
      )}
    </AppShell>
  );
}
