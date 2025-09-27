import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import type { UploadSession } from "@shared/schema";
import "dotenv/config";

type Tables = Database["public"]["Tables"];
type TravelDataRow = Tables["travel_data"]["Row"];
type TravelDataInsert = Tables["travel_data"]["Insert"];
type UploadSessionRow = Tables["upload_sessions"]["Row"];
type UploadSessionInsert = Tables["upload_sessions"]["Insert"];

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing environment variables:", {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
  });
  throw new Error(
    "Missing Supabase environment variables. Please check your .env.local file"
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
export const createBatchTravelData = async (
  data: TravelDataInsert[]
): Promise<TravelDataRow[]> => {
  const { data: result, error } = (await supabase
    .from("travel_data")
    .insert(data as any)
    .select()) as unknown as {
    data: TravelDataRow[] | null;
    error: Error | null;
  };

  if (error) {
    console.error("Error creating batch travel data:", error);
    throw error;
  }
  return result || [];
};

export const getTravelDataBySession = async (
  sessionId: string
): Promise<TravelDataRow[]> => {
  const { data, error } = await supabase
    .from("travel_data")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error getting travel data by session:", error);
    throw error;
  }
  return data || [];
};

export const createUploadSession = async (
  sessionData: Partial<UploadSession>
): Promise<UploadSessionRow> => {
  if (!sessionData.filename) {
    throw new Error("Filename is required");
  }

  // Transform the data to match database column names
  const dbData: UploadSessionInsert = {
    filename: sessionData.filename,
    total_records: sessionData.totalRecords || "0",
    opening_balance: sessionData.opening_balance || null,
  };

  const { data, error } = (await supabase
    .from("upload_sessions")
    .insert(dbData as any)
    .select()
    .single()) as unknown as {
    data: UploadSessionRow | null;
    error: Error | null;
  };

  if (error) {
    console.error("Error creating upload session:", error);
    throw error;
  }

  if (!data) {
    throw new Error("Failed to create upload session");
  }

  return data;
};
