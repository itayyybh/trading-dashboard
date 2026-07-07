import { supabase } from "../../lib/supabaseClient";

export async function listPortfolios() {
  const { data, error } = await supabase
    .from("portfolios")
    .select("id, name, created_at")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function createPortfolio(name) {
  const { data, error } = await supabase
    .from("portfolios")
    .insert({ name })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePortfolio(id) {
  const { error } = await supabase.from("portfolios").delete().eq("id", id);
  if (error) throw error;
}
