import type { Request, Response } from "express";

import * as transactionService from "./transaction.service.js";

import type {
  CreateTransactionInput,
  TransactionQuery,
  TransactionStatusInput,
} from "./transaction.schema.js";

export async function createTransaction(
  req: Request<{}, {}, CreateTransactionInput>,
  res: Response,
) {
  const merchantId = req.user.id;

  const transaction =
    await transactionService.createTransaction(
      merchantId,
      req.body,
    );

  return res.status(201).json({
    success: true,

    data: {
      transaction,
    },
  });
}

export async function listTransactions(
  req: Request,
  res: Response,
) {
  const merchantId = req.user.id;

  const result =
  await transactionService.listTransactions(
    merchantId,
    res.locals.query as TransactionQuery,
  );

  return res.status(200).json({
    success: true,

    data: result,
  });
}

export async function getTransaction(
  req: Request<{ transactionId: string }>,
  res: Response,
) {
  const merchantId = req.user.id;

  const transaction =
    await transactionService.getTransactionById(
      merchantId,
      req.params.transactionId,
    );

  return res.status(200).json({
    success: true,

    data: {
      transaction,
    },
  });
}

export async function updateTransactionStatus(
  req: Request<
    { transactionId: string },
    {},
    TransactionStatusInput
  >,
  res: Response,
) {
  const merchantId = req.user.id;

  const transaction =
    await transactionService.updateTransactionStatus(
      merchantId,
      req.params.transactionId,
      req.body,
    );

  return res.status(200).json({
    success: true,

    data: {
      transaction,
    },
  });
}