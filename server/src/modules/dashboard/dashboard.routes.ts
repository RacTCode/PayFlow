import { Router } from "express";

import { requireAuth } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";

import { getDashboard } from "./dashboard.controller.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  asyncHandler(getDashboard),
);

export default router;