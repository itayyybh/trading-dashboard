import { supabase } from "../../lib/supabaseClient";

const CHUNK_SIZE = 500;

export async function importTrades({ portfolioId, filename, mappingTemplateId, trades }) {
  const { data: batch, error: batchError } = await supabase
    .from("import_batches")
    .insert({
      portfolio_id: portfolioId,
      mapping_template_id: mappingTemplateId ?? null,
      original_filename: filename,
      row_count: trades.length,
      status: trades.length ? "success" : "failed",
    })
    .select()
    .single();

  if (batchError) throw batchError;

  for (let i = 0; i < trades.length; i += CHUNK_SIZE) {
    const chunk = trades.slice(i, i + CHUNK_SIZE).map((t) => ({
      ...t,
      portfolio_id: portfolioId,
      import_batch_id: batch.id,
    }));

    const { error } = await supabase.from("trades").insert(chunk);
    if (error) throw error;
  }

  return batch;
}
