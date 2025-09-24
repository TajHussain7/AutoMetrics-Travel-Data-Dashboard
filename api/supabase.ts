import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing environment variables:", {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
  });
  throw new Error(
    "Missing Supabase environment variables. Please check your .env.local file."
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  db: {
    schema: "public",
  },
});

// Helper functions for server-side operations
export const createBatchTravelData = async (data: any[]) => {
  const { data: result, error } = await supabase
    .from("travel_data")
    .insert(data)
    .select();

  if (error) {
    console.error("Error creating batch travel data:", error);
    throw error;
  }
  return result;
};

export const getTravelDataBySession = async (sessionId: string) => {
  const { data, error } = await supabase
    .from("travel_data")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error getting travel data by session:", error);
    throw error;
  }
  return data;
};

export const createUploadSession = async (sessionData: any) => {
  const { data, error } = await supabase
    .from("upload_sessions")
    .insert([sessionData])
    .select()
    .single();

  if (error) {
    console.error("Error creating upload session:", error);
    throw error;
  }
  return data;
};
