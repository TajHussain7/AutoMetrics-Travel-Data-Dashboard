import { z } from "zod";

// Base interfaces
export interface TravelData {
  id: string;
  sessionId: string;
  date: string;
  voucher: string;
  reference?: string;
  narration?: string;
  debit?: number;
  credit?: number;
  balance?: number;
  customerName?: string;
  route?: string;
  pnr?: string;
  flyingDate?: string;
  flyingStatus?: string;
  customerRate?: number;
  companyRate?: number;
  profit?: number;
  bookingStatus: string;
  paymentStatus: string;
  createdAt: Date;
}

export interface UploadSession {
  id: string;
  filename: string;
  openingBalance?: {
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
  customerName: z.string().optional(),
  route: z.string().optional(),
  pnr: z.string().optional(),
  flyingDate: z.string().optional(),
  flyingStatus: z.string().optional(),
  customerRate: z.number().optional(),
  companyRate: z.number().optional(),
  profit: z.number().optional(),
  bookingStatus: z.string().default("Pending"),
  paymentStatus: z.string().default("Pending"),
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
      customerName: z.string().nullable(),
      route: z.string().nullable(),
      pnr: z.string().nullable(),
      flyingDate: z.string().nullable(),
      flyingStatus: z.string().nullable(),
      customerRate: z.number().nullable(),
      companyRate: z.number().nullable(),
      profit: z.number().nullable(),
      bookingStatus: z.string(),
      paymentStatus: z.string(),
    })
  ),
});

export type UploadResponse = z.infer<typeof uploadResponseSchema>;
