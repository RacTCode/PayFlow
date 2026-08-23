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

const router = Router();

router.post(
  "/register",
  validateBody(registerSchema),
  asyncHandler(register),
);

router.post(
  "/login",
  validateBody(loginSchema),
  asyncHandler(login),
);

router.post(
  "/logout",
  requireAuth,
);

export default router;