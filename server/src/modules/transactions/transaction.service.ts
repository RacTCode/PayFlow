import { Prisma } from "../../generated/prisma/client.js";

import { prisma } from "../../config/database.js";
import { AppError } from "../../utils/app-error.js";
import { generateTransactionId } from "../../utils/transaction-id.js";

import type {
  CreateTransactionInput,
  TransactionQuery,
  TransactionStatusInput,
} from "./transaction.schema.js";

export async function createTransaction(
  merchantId: string,
  input: CreateTransactionInput,
) {
  const transactionId = generateTransactionId();

  const qrPayload =
    `payflow://payment?transactionId=${transactionId}`;

  const transaction = await prisma.transaction.create({
    data: {
      transactionId,
      merchantId,

      amount: new Prisma.Decimal(
        input.amount,
      ),

      currency: input.currency,

      status: "PENDING",

      paymentMethod: input.paymentMethod,

      customerReference:
        input.customerReference,

      qrPayload,
    },
  });

  return transaction;
}

export async function listTransactions(
  merchantId: string,
  query: TransactionQuery,
) {
  const {
    search,
    status,
    from,
    to,
    page,
    limit,
  } = query;

  const where: Prisma.TransactionWhereInput = {
    merchantId,

    ...(status
      ? {
          status,
        }
      : {}),

    ...(search
      ? {
          OR: [
            {
              transactionId: {
                contains: search,
              },
            },
            {
              customerReference: {
                contains: search,
              },
            },
          ],
        }
      : {}),

    ...(from || to
      ? {
          createdAt: {
            ...(from
              ? {
                  gte: from,
                }
              : {}),

            ...(to
              ? {
                  lte: to,
                }
              : {}),
          },
        }
      : {}),
  };

  const skip = (page - 1) * limit;

  const [transactions, total] =
    await prisma.$transaction([
      prisma.transaction.findMany({
        where,

        orderBy: {
          createdAt: "desc",
        },

        skip,
        take: limit,
      }),

      prisma.transaction.count({
        where,
      }),
    ]);

  return {
    transactions,

    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(
        total / limit,
      ),
    },
  };
}

export async function getTransactionById(
  merchantId: string,
  transactionId: string,
) {
  const transaction =
    await prisma.transaction.findFirst({
      where: {
        transactionId,
        merchantId,
      },
    });

  if (!transaction) {
    throw new AppError(
      "Transaction not found",
      404,
      "TRANSACTION_NOT_FOUND",
    );
  }

  return transaction;
}

export async function updateTransactionStatus(
  merchantId: string,
  transactionId: string,
  input: TransactionStatusInput,
) {
  const transaction =
    await prisma.transaction.findFirst({
      where: {
        transactionId,
        merchantId,
      },
    });

  if (!transaction) {
    throw new AppError(
      "Transaction not found",
      404,
      "TRANSACTION_NOT_FOUND",
    );
  }

  if (transaction.status !== "PENDING") {
    throw new AppError(
      "Only pending transactions can be updated",
      409,
      "TRANSACTION_ALREADY_COMPLETED",
    );
  }

  return prisma.transaction.update({
    where: {
      id: transaction.id,
    },

    data: {
      status: input.status,
    },
  });
}