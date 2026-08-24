import { Router } from "express";

import {
  login,
  logout,
  register,
} from "./auth.controller.js";

import {
  loginSchema,
  registerSchema,
} from "./auth.schema.js";

import { requireAuth } from "../../middleware/auth.middleware.js";
import { validateBody } from "../../middleware/validate.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { authRateLimiter } from "../../middleware/rate-limit.middleware.js";

const router = Router();

router.post(
  "/register",
  authRateLimiter,
  validateBody(registerSchema),
  asyncHandler(register),
);

router.post(
  "/login",
  authRateLimiter,
  validateBody(loginSchema),
  asyncHandler(login),
);

router.post(
  "/logout",
  requireAuth,
  logout,
);

export default router;