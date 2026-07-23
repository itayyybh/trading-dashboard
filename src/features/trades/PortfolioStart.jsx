import Button from "../../ui/Button";
import { C, radius, space, label as labelStyle, type } from "../../ui/theme";
import { ASSET_CLASS_BY_ID, PLATFORM_BY_ID } from "../portfolios/constants";

// The first-run view for a portfolio that has no trades yet. Instead of a bare
// dashed placeholder, it reflects the account's identity (what it trades, where
// it imports from) and offers one designed, intentional way to bring trades in.
// Reuses the existing import flow and manual-log modal — no pipeline changes.
export default function PortfolioStart({ portfolio, onImport, onLogTrade, onManage }) {
  const asset = portfolio.asset_class ? ASSET_CLASS_BY_ID[portfolio.asset_class] : null;
  const platforms = (portfolio.preferred_platforms ?? [])
    .map((id) => PLATFORM_BY_ID[id])
    .filter(Boolean);
  const hasIdentity = Boolean(asset) || platforms.length > 0;

  return (
    <div style={{ maxWidth: 660 }}>
      {/* Identity */}
      <section style={{ marginBottom: space.section }}>
        <div style={{ ...labelStyle, color: C.brand }}>New portfolio</div>
        <h2 style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.03em", margin: "10px 0 0", color: C.text }}>
          {portfolio.name}
        </h2>
        {portfolio.description && (
          <p style={{ fontSize: 14, color: C.textDim, lineHeight: 1.6, margin: "10px 0 0", maxWidth: 560 }}>
            {portfolio.description}
          </p>
        )}

        {hasIdentity ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "24px 48px", marginTop: space.xl }}>
            {asset && (
              <Facet label="Trades">
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: C.text, fontWeight: 600, fontSize: 14 }}>
                  <span style={{ display: "inline-flex", color: C.brand }}>
                    <asset.Icon width="18" height="18" />
                  </span>
                  {asset.label}
                </span>
              </Facet>
            )}
            {platforms.length > 0 && (
              <Facet label="Imports from">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
                  {platforms.map((p) => (
                    <span key={p.id} style={{ display: "inline-flex", alignItems: "center", gap: 7, color: C.text, fontWeight: 600, fontSize: 14 }}>
                      <span style={{ display: "inline-flex", color: C.textDim }}>
                        <p.Icon width="17" height="17" />
                      </span>
                      {p.label}
                    </span>
                  ))}
                </div>
              </Facet>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={onManage}
            style={{
              marginTop: space.lg,
              background: "transparent",
              border: "none",
              padding: 0,
              color: C.brand,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Set what you trade and your usual platforms →
          </button>
        )}
      </section>

      {/* Start module — one intentional, focused surface (not a dashed box) */}
      <section
        style={{
          background: C.panel,
          border: `1px solid ${C.border}`,
          borderRadius: radius.lg,
          padding: 28,
        }}
      >
        <div style={type.subsectionLabel}>Bring in your trades</div>
        <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.6, margin: "8px 0 0", maxWidth: 520 }}>
          Import a broker CSV and DASH detects the format automatically — TradingView, Interactive Brokers,
          Tradovate, Binance and more. Or add one by hand to get started.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: space.xl }}>
          <Button variant="primary" size="md" icon="↑" onClick={onImport}>
            Import CSV
          </Button>
          <Button variant="secondary" size="md" onClick={onLogTrade}>
            Log a trade
          </Button>
        </div>

        <div style={{ height: 1, background: C.borderSoft, margin: "24px 0 0" }} />

        <div style={{ marginTop: 18 }}>
          <span style={{ ...labelStyle }}>Once you import, you'll unlock</span>
          <div style={{ fontSize: 13, color: C.textDim, marginTop: 8, lineHeight: 1.6 }}>
            {["Equity curve", "Win rate & streaks", "Daily P&L calendar", "Long / short breakdown"].join("   ·   ")}
          </div>
        </div>
      </section>
    </div>
  );
}

function Facet({ label, children }) {
  return (
    <div>
      <div style={{ ...labelStyle, marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}
