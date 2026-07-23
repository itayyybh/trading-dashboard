import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useLocale } from "../../lib/i18n/LocaleContext";
import AppShell from "../../ui/AppShell";
import Button from "../../ui/Button";
import EmptyState from "../../ui/EmptyState";
import { C, type, space, radius, transition, font } from "../../ui/theme";
import LocaleToggle from "../shared/LocaleToggle";
import PortfolioRow from "./PortfolioRow";
import PortfolioWizard from "./PortfolioWizard";
import PortfolioEditForm from "./PortfolioEditForm";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import {
  listPortfolios,
  listDeletedPortfolios,
  getTradeCounts,
  createPortfolio,
  updatePortfolio,
  archivePortfolio,
  unarchivePortfolio,
  softDeletePortfolio,
  restorePortfolio,
  deletePortfolioForever,
} from "./api";

// The dedicated portfolio management surface (/portfolios). One page holds the
// whole lifecycle — active, archived, and Recently Deleted — as narrative
// sections separated by whitespace, not boxes. Portfolio switching still lives
// on the dashboard; this is where accounts are configured and curated.
export default function PortfoliosPage() {
  const { t } = useLocale();
  const navigate = useNavigate();

  const [live, setLive] = useState(null); // null = loading
  const [deleted, setDeleted] = useState([]);
  const [counts, setCounts] = useState({});
  const [error, setError] = useState(null);

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null); // portfolio | null
  const [confirming, setConfirming] = useState(null); // { portfolio, mode } | null

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const [liveRows, deletedRows] = await Promise.all([listPortfolios(), listDeletedPortfolios()]);
      setLive(liveRows);
      setDeleted(deletedRows);
      const ids = [...liveRows, ...deletedRows].map((p) => p.id);
      setCounts(await getTradeCounts(ids));
    } catch (e) {
      setLive([]);
      setError(e.message);
    }
  }

  const countOf = (id) => counts[id] ?? 0;

  // --- Mutations (optimistic-ish: refetch-free local updates) -----------------

  async function handleCreate(fields) {
    const created = await createPortfolio(fields);
    setLive((prev) => [...(prev ?? []), created]);
    setCreating(false);
  }

  async function handleEdit(fields) {
    const updated = await updatePortfolio(editing.id, fields);
    setLive((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setEditing(null);
  }

  async function handleRename(portfolio, name) {
    const updated = await updatePortfolio(portfolio.id, { name });
    setLive((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  async function handleArchive(portfolio) {
    const updated = await archivePortfolio(portfolio.id);
    setLive((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  async function handleUnarchive(portfolio) {
    const updated = await unarchivePortfolio(portfolio.id);
    setLive((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  // Empty portfolios delete straight to the trash; those with trades ask first.
  function requestDelete(portfolio) {
    if (countOf(portfolio.id) === 0) doSoftDelete(portfolio);
    else setConfirming({ portfolio, mode: "soft" });
  }

  async function doSoftDelete(portfolio) {
    const moved = await softDeletePortfolio(portfolio.id);
    setLive((prev) => prev.filter((p) => p.id !== portfolio.id));
    setDeleted((prev) => [moved, ...prev]);
    setConfirming(null);
  }

  async function handleRestore(portfolio) {
    const restored = await restorePortfolio(portfolio.id);
    setDeleted((prev) => prev.filter((p) => p.id !== portfolio.id));
    setLive((prev) => [...(prev ?? []), restored]);
  }

  // Delete-forever is irreversible, so it always confirms.
  function requestForever(portfolio) {
    setConfirming({ portfolio, mode: "forever" });
  }

  async function doDeleteForever(portfolio) {
    await deletePortfolioForever(portfolio.id);
    setDeleted((prev) => prev.filter((p) => p.id !== portfolio.id));
    setConfirming(null);
  }

  const topRight = (
    <>
      <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
        ← Dashboard
      </Button>
      <LocaleToggle />
      <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()}>
        {t("signOut")}
      </Button>
    </>
  );

  const active = (live ?? []).filter((p) => !p.archived_at);
  const archived = (live ?? []).filter((p) => p.archived_at);

  return (
    <AppShell topRight={topRight}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: space.xl }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: "-0.03em", color: C.text }}>Portfolios</h1>
          <p style={{ fontSize: 13, color: C.muted, margin: "6px 0 0" }}>
            Set up and manage your trading accounts.
          </p>
        </div>
        <Button variant="primary" size="sm" icon="+" onClick={() => setCreating(true)}>
          New portfolio
        </Button>
      </div>

      {live === null ? (
        <EmptyState variant="loading" title={t("loading")} />
      ) : error ? (
        <EmptyState variant="error" title={t("somethingWentWrong")} subtitle={error} />
      ) : active.length === 0 && archived.length === 0 && deleted.length === 0 ? (
        <EmptyState
          title="Create your first portfolio"
          subtitle="A portfolio is a trading account inside DASH — set one up to start importing and analyzing trades."
          action={
            <Button variant="primary" size="sm" icon="+" onClick={() => setCreating(true)}>
              New portfolio
            </Button>
          }
        />
      ) : (
        <>
          {/* Active */}
          <section style={{ marginBottom: space.section }}>
            <SectionHeading title="Active" count={active.length} />
            {active.length ? (
              <div style={{ marginTop: space.sm }}>
                {active.map((p) => (
                  <PortfolioRow
                    key={p.id}
                    portfolio={p}
                    tradeCount={countOf(p.id)}
                    onRename={(name) => handleRename(p, name)}
                    onEdit={() => setEditing(p)}
                    onArchive={() => handleArchive(p)}
                    onDelete={() => requestDelete(p)}
                  />
                ))}
              </div>
            ) : (
              <QuietNote>No active portfolios. Create one, or restore from Recently Deleted below.</QuietNote>
            )}
          </section>

          {/* Archived */}
          {archived.length > 0 && (
            <section style={{ marginBottom: space.section }}>
              <SectionHeading title="Archived" count={archived.length} caption="Hidden from the dashboard, kept intact." />
              <div style={{ marginTop: space.sm }}>
                {archived.map((p) => (
                  <PortfolioRow
                    key={p.id}
                    portfolio={p}
                    tradeCount={countOf(p.id)}
                    archived
                    onRename={(name) => handleRename(p, name)}
                    onEdit={() => setEditing(p)}
                    onUnarchive={() => handleUnarchive(p)}
                    onDelete={() => requestDelete(p)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Recently Deleted */}
          {deleted.length > 0 && (
            <section style={{ marginBottom: space.section }}>
              <SectionHeading title="Recently Deleted" count={deleted.length} caption="Restore anytime, or delete forever." />
              <div style={{ marginTop: space.sm }}>
                {deleted.map((p) => (
                  <DeletedRow
                    key={p.id}
                    portfolio={p}
                    tradeCount={countOf(p.id)}
                    onRestore={() => handleRestore(p)}
                    onForever={() => requestForever(p)}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {creating && <PortfolioWizard onCreate={handleCreate} onClose={() => setCreating(false)} />}

      {editing && (
        <PortfolioEditForm portfolio={editing} onSave={handleEdit} onClose={() => setEditing(null)} />
      )}

      {confirming && (
        <DeleteConfirmDialog
          portfolio={confirming.portfolio}
          tradeCount={countOf(confirming.portfolio.id)}
          mode={confirming.mode}
          onConfirm={() =>
            confirming.mode === "forever"
              ? doDeleteForever(confirming.portfolio)
              : doSoftDelete(confirming.portfolio)
          }
          onClose={() => setConfirming(null)}
        />
      )}
    </AppShell>
  );
}

function SectionHeading({ title, count, caption }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={type.sectionHeader}>{title}</span>
        {typeof count === "number" && (
          <span style={{ fontFamily: font.mono, fontSize: 13, color: C.muted, fontVariantNumeric: "tabular-nums" }}>
            {count}
          </span>
        )}
      </div>
      {caption && <div style={{ fontSize: 12.5, color: C.muted, marginTop: 3 }}>{caption}</div>}
    </div>
  );
}

function QuietNote({ children }) {
  return <div style={{ fontSize: 13, color: C.muted, padding: "18px 12px" }}>{children}</div>;
}

// Recently-deleted rows carry a distinct action pair (Restore / Delete forever)
// rather than the "⋯" menu, so recovery is one obvious click.
function DeletedRow({ portfolio, tradeCount, onRestore, onForever }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "13px 12px",
        borderRadius: radius.md,
        borderTop: `1px solid ${C.borderSoft}`,
        background: hover ? C.panel2 : "transparent",
        transition: `background ${transition}`,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: C.textDim }}>{portfolio.name}</span>
        <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
          {tradeCount === 1 ? "1 trade" : `${tradeCount} trades`}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <Button variant="secondary" size="sm" onClick={onRestore}>
          Restore
        </Button>
        <Button variant="danger" size="sm" onClick={onForever}>
          Delete forever
        </Button>
      </div>
    </div>
  );
}
