export type UserRole =
  | "MERCHANT"
  | "ADMIN";

export type TransactionStatus =
  | "PENDING"
  | "SUCCESSFUL"
  | "FAILED";

export type PaymentMethod = "QR";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Transaction {
  id: string;
  transactionId: string;
  merchantId: string;
  amount: string;
  currency: string;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  customerReference: string | null;
  qrPayload: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}