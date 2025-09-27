import {
  supabase,
  createBatchTravelData,
  getTravelDataBySession,
  createUploadSession,
} from "./supabase";
import type { TravelData, UploadSession } from "@shared/schema";
import type { Database } from "./database.types";

type Tables = Database["public"]["Tables"];
type TravelDataRow = Tables["travel_data"]["Row"];
type TravelDataInsert = Tables["travel_data"]["Insert"];
type TravelDataUpdate = Tables["travel_data"]["Update"];
type UploadSessionRow = Tables["upload_sessions"]["Row"];
type UploadSessionInsert = Tables["upload_sessions"]["Insert"];

class SupabaseStorage {
  async createTravelDataBatch(
    data: TravelDataInsert[]
  ): Promise<TravelDataRow[]> {
    return createBatchTravelData(data);
  }

  async getTravelDataBySession(sessionId: string): Promise<TravelDataRow[]> {
    return getTravelDataBySession(sessionId);
  }

  async createUploadSession(
    sessionData: Partial<UploadSession>
  ): Promise<UploadSessionRow> {
    return createUploadSession(sessionData);
  }

  async updateTravelData(
    id: string,
    updates: TravelDataUpdate
  ): Promise<TravelDataRow> {
    const { data, error } = (await supabase
      .from("travel_data")
      .update(updates as any)
      .eq("id", id)
      .select()
      .single()) as unknown as {
      data: TravelDataRow | null;
      error: Error | null;
    };

    if (error) throw error;
    if (!data) throw new Error("Travel data not found");
    return data;
  }

  async deleteTravelData(id: string): Promise<void> {
    const { error } = (await supabase
      .from("travel_data")
      .delete()
      .eq("id", id)) as unknown as {
      error: Error | null;
    };

    if (error) throw error;
  }

  async getUploadSessionsForUser(userId: string): Promise<UploadSessionRow[]> {
    const { data, error } = (await supabase
      .from("upload_sessions")
      .select()
      .order("created_at", { ascending: false })
      .eq("user_id", userId)) as unknown as {
      data: UploadSessionRow[] | null;
      error: Error | null;
    };

    if (error) throw error;
    return data || [];
  }

  async getRecentUploadSessions(): Promise<UploadSessionRow[]> {
    const { data, error } = (await supabase
      .from("upload_sessions")
      .select()
      .order("created_at", { ascending: false })
      .limit(10)) as unknown as {
      data: UploadSessionRow[] | null;
      error: Error | null;
    };

    if (error) throw error;
    return data || [];
  }
}

export const storage = new SupabaseStorage();
