import { z } from "zod";

// Base interfaces
export interface TravelData {
  id: string;
  session_id: string;
  date: string;
  voucher: string;
  reference?: string;
  narration?: string;
  debit?: number;
  credit?: number;
  balance?: number;
  customer_name?: string;
  route?: string;
  pnr?: string;
  flying_date?: string;
  flying_status?: string;
  customer_rate?: number;
  company_rate?: number;
  profit?: number;
  booking_status: string;
  payment_status: string;
  createdAt: Date;
}

export interface UploadSession {
  id: string;
  filename: string;
  opening_balance?: {
    date: string;
    amount: number;
  };
  totalRecords?: string;
  processedAt: Date;
}

// Validation schemas
export const insertTravelDataSchema = z.object({
  sessionId: z.string(),
  date: z.string(),
  voucher: z.string(),
  reference: z.string().optional(),
  narration: z.string().optional(),
  debit: z.number().optional(),
  credit: z.number().optional(),
  balance: z.number().optional(),
  customer_name: z.string().optional(),
  route: z.string().optional(),
  pnr: z.string().optional(),
  flying_date: z.string().optional(),
  flying_status: z.string().optional(),
  customer_rate: z.number().optional(),
  company_rate: z.number().optional(),
  profit: z.number().optional(),
  booking_status: z.string().default("Pending"),
  payment_status: z.string().default("Pending"),
});

export const insertUploadSessionSchema = z.object({
  filename: z.string(),
  openingBalance: z
    .object({
      date: z.string(),
      amount: z.number(),
    })
    .optional(),
  totalRecords: z.string().optional(),
});

// Additional schemas for API responses
export const uploadResponseSchema = z.object({
  sessionId: z.string(),
  filename: z.string(),
  totalRecords: z.number(),
  openingBalance: z
    .object({
      date: z.string(),
      amount: z.number(),
    })
    .nullable(),
  entries: z.array(
    z.object({
      date: z.string(),
      voucher: z.string(),
      reference: z.string().nullable(),
      narration: z.string().nullable(),
      debit: z.number().nullable(),
      credit: z.number().nullable(),
      balance: z.number().nullable(),
      customer_name: z.string().nullable(),
      route: z.string().nullable(),
      pnr: z.string().nullable(),
      flying_date: z.string().nullable(),
      flying_status: z.string().nullable(),
      customer_rate: z.number().nullable(),
      company_rate: z.number().nullable(),
      profit: z.number().nullable(),
      booking_status: z.string(),
      payment_status: z.string(),
    })
  ),
});

export type UploadResponse = z.infer<typeof uploadResponseSchema>;
