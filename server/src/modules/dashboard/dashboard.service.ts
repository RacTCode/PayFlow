import { Prisma } from "../../generated/prisma/client.js";

import { prisma } from "../../config/database.js";

export async function getDashboard(
  merchantId: string,
) {
  const [
    totalTransactions,
    successfulTransactions,
    pendingTransactions,
    failedTransactions,
    volumeResult,
  ] = await prisma.$transaction([
    prisma.transaction.count({
      where: {
        merchantId,
      },
    }),

    prisma.transaction.count({
      where: {
        merchantId,
        status: "SUCCESSFUL",
      },
    }),

    prisma.transaction.count({
      where: {
        merchantId,
        status: "PENDING",
      },
    }),

    prisma.transaction.count({
      where: {
        merchantId,
        status: "FAILED",
      },
    }),

    prisma.transaction.aggregate({
      where: {
        merchantId,
        status: "SUCCESSFUL",
      },

      _sum: {
        amount: true,
      },
    }),
  ]);

  return {
    totalTransactions,

    successfulTransactions,

    pendingTransactions,

    failedTransactions,

    totalVolume:
      volumeResult._sum.amount ??
      new Prisma.Decimal(0),
  };
}