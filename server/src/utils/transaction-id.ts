//makes the transaction ID generated be pretty :P
import crypto from "node:crypto";

export function generateTransactionId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();

  const random = crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase();

  return `TXN-${timestamp}-${random}`;
}