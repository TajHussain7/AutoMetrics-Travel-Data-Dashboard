import {
  supabase,
  createBatchTravelData,
  getTravelDataBySession,
  createUploadSession,
} from "./supabase";
import type { TravelData, UploadSession } from "@shared/schema";

class SupabaseStorage {
  async createTravelDataBatch(
    data: Partial<TravelData>[]
  ): Promise<TravelData[]> {
    return createBatchTravelData(data);
  }

  async getTravelDataBySession(sessionId: string): Promise<TravelData[]> {
    return getTravelDataBySession(sessionId);
  }

  async createUploadSession(
    sessionData: Partial<UploadSession>
  ): Promise<UploadSession> {
    return createUploadSession(sessionData);
  }

  async updateTravelData(
    id: string,
    updates: Partial<TravelData>
  ): Promise<TravelData> {
    const { data, error } = await supabase
      .from("travel_data")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteTravelData(id: string): Promise<void> {
    const { error } = await supabase.from("travel_data").delete().eq("id", id);

    if (error) throw error;
  }

  async getRecentUploadSessions(): Promise<UploadSession[]> {
    const { data, error } = await supabase
      .from("upload_sessions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;
    return data;
  }
}

export const storage = new SupabaseStorage();
