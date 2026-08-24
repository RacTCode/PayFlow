import { api } from "@/lib/api";

import type {
  ApiResponse,
  Transaction,
  TransactionStatus,
} from "@/types/api";

export interface TransactionFilters {
  search?: string;
  status?: TransactionStatus | "ALL";
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface TransactionList {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getTransactions(
  filters: TransactionFilters = {},
): Promise<TransactionList> {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (
    filters.status &&
    filters.status !== "ALL"
  ) {
    params.set("status", filters.status);
  }

  if (filters.from) {
    params.set("from", filters.from);
  }

  if (filters.to) {
    params.set("to", filters.to);
  }

  if (filters.page) {
    params.set("page", String(filters.page));
  }

  if (filters.limit) {
    params.set("limit", String(filters.limit));
  }

  const queryString = params.toString();

  const response = await api.get<
    ApiResponse<TransactionList>
  >(
    queryString
      ? `/transactions?${queryString}`
      : "/transactions",
  );

  return response.data.data;
}

export async function getTransaction(
  transactionId: string,
): Promise<Transaction> {
  const response = await api.get<
    ApiResponse<{ transaction: Transaction }>
  >(`/transactions/${transactionId}`);

  return response.data.data.transaction;
}

export interface CreateTransactionInput {
  amount: number;
  currency?: string;
  paymentMethod?: "QR";
  customerReference?: string;
}

export async function createTransaction(
  input: CreateTransactionInput,
): Promise<Transaction> {
  const response = await api.post<
    ApiResponse<{ transaction: Transaction }>
  >("/transactions", input);

  return response.data.data.transaction;
}

export async function updateTransactionStatus(
  transactionId: string,
  status: "SUCCESSFUL" | "FAILED",
): Promise<Transaction> {
  const response = await api.patch<
    ApiResponse<{ transaction: Transaction }>
  >(
    `/transactions/${transactionId}/status`,
    { status },
  );

  return response.data.data.transaction;
}