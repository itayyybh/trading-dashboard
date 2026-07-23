import { supabase } from "../../lib/supabaseClient";

// Columns selected everywhere a portfolio is read. Kept in one place so adding a
// field (tags, settings…) later is a one-line change.
const COLUMNS =
  "id, name, asset_class, preferred_platforms, description, archived_at, deleted_at, created_at";

// --- Reads --------------------------------------------------------------------

// Live portfolios (not soft-deleted), active + archived. Callers split on
// `archived_at` client-side so a single query powers the whole page.
export async function listPortfolios() {
  const { data, error } = await supabase
    .from("portfolios")
    .select(COLUMNS)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

// The "Recently Deleted" set — soft-deleted rows, most-recent first.
export async function listDeletedPortfolios() {
  const { data, error } = await supabase
    .from("portfolios")
    .select(COLUMNS)
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });

  if (error) throw error;
  return data;
}

// Trade counts for a set of portfolios, as { [portfolioId]: count }. One query
// (no N+1); portfolios with zero trades simply won't appear in the map.
export async function getTradeCounts(portfolioIds) {
  if (!portfolioIds?.length) return {};
  const { data, error } = await supabase
    .from("trades")
    .select("portfolio_id")
    .in("portfolio_id", portfolioIds);

  if (error) throw error;
  const counts = {};
  for (const row of data) counts[row.portfolio_id] = (counts[row.portfolio_id] ?? 0) + 1;
  return counts;
}

// --- Writes -------------------------------------------------------------------

// Accepts the full metadata shape from the creation wizard. Only `name` is
// required; everything else is optional and normalized to a safe default.
export async function createPortfolio(fields) {
  const payload = normalizeWritable(fields);
  const { data, error } = await supabase
    .from("portfolios")
    .insert(payload)
    .select(COLUMNS)
    .single();

  if (error) throw error;
  return data;
}

// Partial update — pass only the fields that changed (name, asset_class,
// preferred_platforms, description).
export async function updatePortfolio(id, fields) {
  const { data, error } = await supabase
    .from("portfolios")
    .update(normalizeWritable(fields, { partial: true }))
    .eq("id", id)
    .select(COLUMNS)
    .single();

  if (error) throw error;
  return data;
}

export async function archivePortfolio(id) {
  return setTimestamp(id, "archived_at", new Date().toISOString());
}

export async function unarchivePortfolio(id) {
  return setTimestamp(id, "archived_at", null);
}

// Soft delete: moves the portfolio (and, implicitly, its analytics) into
// Recently Deleted without touching any trade rows, so it can be restored
// intact. Also clears any archived state so restore is unambiguous.
export async function softDeletePortfolio(id) {
  const { data, error } = await supabase
    .from("portfolios")
    .update({ deleted_at: new Date().toISOString(), archived_at: null })
    .eq("id", id)
    .select(COLUMNS)
    .single();

  if (error) throw error;
  return data;
}

export async function restorePortfolio(id) {
  return setTimestamp(id, "deleted_at", null);
}

// The only hard delete. Cascades to trades / import_batches via FK, so it is
// irreversible — reserved for "Delete forever" from Recently Deleted.
export async function deletePortfolioForever(id) {
  const { error } = await supabase.from("portfolios").delete().eq("id", id);
  if (error) throw error;
}

// --- Helpers ------------------------------------------------------------------

async function setTimestamp(id, column, value) {
  const { data, error } = await supabase
    .from("portfolios")
    .update({ [column]: value })
    .eq("id", id)
    .select(COLUMNS)
    .single();

  if (error) throw error;
  return data;
}

// Maps the wizard/edit form shape to writable columns. Trims the name, coerces
// blank optionals to null, and guarantees preferred_platforms is an array.
// `partial` omits keys the caller didn't provide (for updates).
function normalizeWritable(fields = {}, { partial = false } = {}) {
  const out = {};
  const has = (k) => Object.prototype.hasOwnProperty.call(fields, k);

  if (!partial || has("name")) out.name = String(fields.name ?? "").trim();
  if (!partial || has("asset_class")) out.asset_class = fields.asset_class || null;
  if (!partial || has("preferred_platforms"))
    out.preferred_platforms = Array.isArray(fields.preferred_platforms)
      ? fields.preferred_platforms
      : [];
  if (!partial || has("description")) {
    const desc = String(fields.description ?? "").trim();
    out.description = desc || null;
  }
  return out;
}
