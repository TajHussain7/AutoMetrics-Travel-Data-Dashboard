import { randomUUID } from "crypto";
import type { TravelData, UploadSession } from "@shared/schema";

export class MemStorage {
  private travelData: Map<string, TravelData>;
  private uploadSessions: Map<string, UploadSession>;

  constructor() {
    this.travelData = new Map();
    this.uploadSessions = new Map();
  }

  async createTravelDataBatch(
    data: Partial<TravelData>[]
  ): Promise<TravelData[]> {
    const results: TravelData[] = [];

    for (const item of data) {
      const id = randomUUID();
      const travelDataItem: TravelData = {
        id,
        sessionId: item.sessionId!,
        date: item.date!,
        voucher: item.voucher!,
        createdAt: new Date(),
        reference: item.reference || undefined,
        narration: item.narration || undefined,
        debit: item.debit || undefined,
        credit: item.credit || undefined,
        balance: item.balance || undefined,
        customerName: item.customerName || undefined,
        pnr: item.pnr || undefined,
        flyingDate: item.flyingDate || undefined,
        flyingStatus: item.flyingStatus || undefined,
        customerRate: item.customerRate || undefined,
        companyRate: item.companyRate || undefined,
        profit: item.profit || undefined,
        bookingStatus: item.bookingStatus || "Pending",
        paymentStatus: item.paymentStatus || "Pending",
      };
      this.travelData.set(id, travelDataItem);
      results.push(travelDataItem);
    }

    return results;
  }

  async getTravelDataBySession(sessionId: string): Promise<TravelData[]> {
    return Array.from(this.travelData.values()).filter(
      (item) => item.sessionId === sessionId
    );
  }

  async updateTravelData(
    id: string,
    data: Partial<TravelData>
  ): Promise<TravelData> {
    const existing = this.travelData.get(id);
    if (!existing) {
      throw new Error("Travel data not found");
    }

    const updated: TravelData = { ...existing, ...data };
    this.travelData.set(id, updated);
    return updated;
  }

  async deleteTravelData(id: string): Promise<void> {
    this.travelData.delete(id);
  }

  async createUploadSession(
    session: Omit<UploadSession, "id" | "processedAt">
  ): Promise<UploadSession> {
    const id = randomUUID();
    const uploadSession: UploadSession = {
      ...session,
      id,
      processedAt: new Date(),
      totalRecords: session.totalRecords || undefined,
      openingBalance: session.openingBalance || undefined,
    };
    this.uploadSessions.set(id, uploadSession);
    return uploadSession;
  }

  async getUploadSession(id: string): Promise<UploadSession | undefined> {
    return this.uploadSessions.get(id);
  }

  async getRecentUploadSessions(): Promise<UploadSession[]> {
    return Array.from(this.uploadSessions.values())
      .sort(
        (a, b) =>
          new Date(b.processedAt!).getTime() -
          new Date(a.processedAt!).getTime()
      )
      .slice(0, 10);
  }
}

export const storage = new MemStorage();
