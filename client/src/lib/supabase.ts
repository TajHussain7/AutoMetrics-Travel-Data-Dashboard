import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for type-safe queries
export const getTravelData = async () => {
  const { data, error } = await supabase
    .from("travel_data")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const createTravelData = async (data: any) => {
  const { data: result, error } = await supabase
    .from("travel_data")
    .insert([data])
    .select();

  if (error) throw error;
  return result[0];
};

export const updateTravelData = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from("travel_data")
    .update(updates)
    .eq("id", id)
    .select();

  if (error) throw error;
  return data[0];
};

export const deleteTravelData = async (id: string) => {
  const { error } = await supabase.from("travel_data").delete().eq("id", id);

  if (error) throw error;
};
