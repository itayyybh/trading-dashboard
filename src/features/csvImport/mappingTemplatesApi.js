import { supabase } from "../../lib/supabaseClient";

export async function listMappingTemplates() {
  const { data, error } = await supabase
    .from("broker_mapping_templates")
    .select("id, broker_label, column_mapping, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function saveMappingTemplate(brokerLabel, columnMapping) {
  const { data, error } = await supabase
    .from("broker_mapping_templates")
    .insert({ broker_label: brokerLabel, column_mapping: columnMapping })
    .select()
    .single();

  if (error) throw error;
  return data;
}
