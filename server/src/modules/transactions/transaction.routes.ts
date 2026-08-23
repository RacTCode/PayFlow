import { Router } from "express";

import { requireAuth } from "../../middleware/auth.middleware.js";
import { validateBody } from "../../middleware/validate.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";

import {
  createTransaction,
  getTransaction,
  listTransactions,
  updateTransactionStatus,
} from "./transaction.controller.js";

import {
  createTransactionSchema,
  transactionStatusSchema,
} from "./transaction.schema.js";

const router = Router();

router.use(requireAuth);

router.get(
  "/",
  asyncHandler(listTransactions),
);

router.post(
  "/",
  validateBody(createTransactionSchema),
  asyncHandler(createTransaction),
);

router.get(
  "/:transactionId",
  asyncHandler(getTransaction),
);

router.patch(
  "/:transactionId/status",
  validateBody(transactionStatusSchema),
  asyncHandler(updateTransactionStatus),
);

export default router;