export interface Database {
  public: {
    Tables: {
      travel_data: {
        Row: {
          id: string;
          created_at: string;
          session_id: string;
          date: string;
          voucher: string;
          reference: string | null;
          narration: string | null;
          debit: number | null;
          credit: number | null;
          balance: number | null;
          customer_name: string | null;
          route: string | null;
          pnr: string | null;
          flying_date: string | null;
          flying_status: string | null;
          customer_rate: number | null;
          company_rate: number | null;
          profit: number | null;
          booking_status: string;
          payment_status: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["travel_data"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["travel_data"]["Insert"]>;
      };
      upload_sessions: {
        Row: {
          id: string;
          created_at: string;
          filename: string;
          total_records: string;
          opening_balance: {
            date: string;
            amount: number;
          } | null;
        };
        Insert: Omit<
          Database["public"]["Tables"]["upload_sessions"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["upload_sessions"]["Insert"]
        >;
      };
    };
  };
}
