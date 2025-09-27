import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { TravelData, UploadResponse, UploadSession } from "@shared/schema";
import { useTravelData as useTravelDataContext } from "@/contexts/travel-data-context";
import { saveToStorage } from "@/lib/local-storage";

export function useUploadFile() {
  const queryClient = useQueryClient();
  const {
    setUploadResponse,
    setCurrentSessionId,
    setTravelData,
    setIsLoading,
    setError,
  } = useTravelDataContext();

  return useMutation({
    mutationFn: async (file: File): Promise<UploadResponse> => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }

      return response.json();
    },
    onMutate: () => {
      setIsLoading(true);
      setError(null);
    },
    onSuccess: (data) => {
      // Convert entries to TravelData format
      const travelData: TravelData[] = data.entries.map((entry) => ({
        id: crypto.randomUUID(), // Generate unique ID for each entry
        session_id: data.sessionId,
        createdAt: new Date(),
        date: entry.date,
        voucher: entry.voucher,
        reference: entry.reference || undefined,
        narration: entry.narration || undefined,
        debit: entry.debit || undefined,
        credit: entry.credit || undefined,
        balance: entry.balance || undefined,
        customer_name: entry.customer_name || undefined,
        route: entry.route || undefined,
        pnr: entry.pnr || undefined,
        flying_date: entry.flying_date || undefined,
        flying_status: entry.flying_status || undefined,
        customer_rate: entry.customer_rate || undefined,
        company_rate: entry.company_rate || undefined,
        profit: entry.profit || undefined,
        booking_status: entry.booking_status || "Pending",
        payment_status: entry.payment_status || "Pending",
      }));

      // Save to localStorage
      saveToStorage({
        travelData,
        uploadSession: {
          id: data.sessionId,
          filename: data.filename || "Uploaded File",
          processedAt: new Date(),
          totalRecords: travelData.length.toString(),
          opening_balance: data.openingBalance || undefined,
        },
      });

      // Update state
      setTravelData(travelData); // Add this line
      setUploadResponse(data);
      setCurrentSessionId(data.sessionId);
      queryClient.invalidateQueries({ queryKey: ["/api/travel-data"] });
      setIsLoading(false);
    },
    onError: (error) => {
      setError(error.message);
      setIsLoading(false);
    },
  });
}

export function useTravelDataBySession(sessionId: string | null) {
  const { setTravelData } = useTravelDataContext();

  return useQuery({
    queryKey: ["/api/travel-data", sessionId],
    queryFn: async (): Promise<TravelData[]> => {
      if (!sessionId) return [];

      const response = await fetch(`/api/travel-data/${sessionId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch travel data");
      }
      return response.json();
    },
    enabled: !!sessionId,
    select: (data: TravelData[]) => {
      setTravelData(data);
      return data;
    },
  });
}

export function useUpdateTravelData() {
  const queryClient = useQueryClient();
  const { updateTravelDataItem } = useTravelDataContext();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<TravelData>;
    }) => {
      const response = await apiRequest(
        "PATCH",
        `/api/travel-data/${id}`,
        data
      );
      return response.json();
    },
    onSuccess: (updatedItem, { id }) => {
      updateTravelDataItem(id, updatedItem);
      queryClient.invalidateQueries({ queryKey: ["/api/travel-data"] });
    },
  });
}

export function useDeleteTravelData() {
  const queryClient = useQueryClient();
  const { removeTravelDataItem } = useTravelDataContext();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/travel-data/${id}`);
    },
    onSuccess: (_, id) => {
      removeTravelDataItem(id);
      queryClient.invalidateQueries({ queryKey: ["/api/travel-data"] });
    },
  });
}

export function useUploadSessions() {
  return useQuery<UploadSession[]>({
    queryKey: ["/api/upload-sessions"],
    queryFn: async () => {
      const response = await fetch("/api/upload-sessions");
      if (!response.ok) {
        throw new Error("Failed to fetch upload sessions");
      }
      const data: any[] = await response.json();
      // Map database fields to UploadSession interface
      return data.map((session) => ({
        id: session.id,
        filename: session.filename || "Uploaded File",
        opening_balance: session.opening_balance,
        totalRecords: session.total_records,
        processedAt: new Date(session.created_at),
      }));
    },
  });
}
