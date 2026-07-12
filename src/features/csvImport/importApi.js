import { supabase } from "../../lib/supabaseClient";

const CHUNK_SIZE = 500;

export async function listImportBatches(portfolioId) {
  const { data, error } = await supabase
    .from("import_batches")
    .select("original_filename, file_hash, created_at")
    .eq("portfolio_id", portfolioId)
    .not("file_hash", "is", null);

  if (error) throw error;
  return data;
}

// Thrown when the (portfolio_id, file_hash) unique index rejects an insert -
// i.e. this exact file was already imported into this portfolio. Callers
// catch this specifically to show a friendly per-file message instead of
// failing the whole multi-file batch.
export class DuplicateFileError extends Error {
  constructor(filename) {
    super(`"${filename}" was already imported into this portfolio.`);
    this.name = "DuplicateFileError";
    this.filename = filename;
  }
}

export async function importTrades({ portfolioId, filename, fileHash, mappingTemplateId, trades }) {
  const { data: batch, error: batchError } = await supabase
    .from("import_batches")
    .insert({
      portfolio_id: portfolioId,
      mapping_template_id: mappingTemplateId ?? null,
      original_filename: filename,
      file_hash: fileHash ?? null,
      row_count: trades.length,
      status: trades.length ? "success" : "failed",
    })
    .select()
    .single();

  if (batchError) {
    if (batchError.code === "23505") throw new DuplicateFileError(filename);
    throw batchError;
  }

  for (let i = 0; i < trades.length; i += CHUNK_SIZE) {
    const chunk = trades.slice(i, i + CHUNK_SIZE).map((t) => ({
      ...t,
      portfolio_id: portfolioId,
      import_batch_id: batch.id,
      source: "csv_upload",
      source_file: filename,
    }));

    const { error } = await supabase.from("trades").insert(chunk);
    if (error) throw error;
  }

  return batch;
}
