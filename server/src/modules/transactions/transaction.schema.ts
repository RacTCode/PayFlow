import { z } from "zod";

export const createTransactionSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be greater than 0")
    .finite(),

  currency: z
    .string()
    .trim()
    .length(3, "Currency must be a 3-letter code")
    .toUpperCase()
    .default("INR"),

  paymentMethod: z
    .enum(["QR"])
    .default("QR"),

  customerReference: z
    .string()
    .trim()
    .max(100)
    .optional(),
});

export const transactionStatusSchema = z.object({
  status: z.enum(["SUCCESSFUL", "FAILED"]),
});

export const transactionQuerySchema = z.object({
  search: z.string().trim().optional(),

  status: z
    .enum(["PENDING", "SUCCESSFUL", "FAILED"])
    .optional(),

  from: z.coerce.date().optional(),

  to: z.coerce.date().optional(),

  page: z.coerce
    .number()
    .int()
    .positive()
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .default(20),
});

export type CreateTransactionInput =
  z.infer<typeof createTransactionSchema>;

export type TransactionStatusInput =
  z.infer<typeof transactionStatusSchema>;

export type TransactionQuery =
  z.infer<typeof transactionQuerySchema>;