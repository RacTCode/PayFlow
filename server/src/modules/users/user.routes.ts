import { Router } from "express";

import {
  getCurrentUser,
  updateCurrentUser,
} from "./user.controller.js";

import { requireAuth } from "../../middleware/auth.middleware.js";
import { validateBody } from "../../middleware/validate.middleware.js";
import { updateUserSchema } from "./user.schema.js";

import { asyncHandler } from "../../utils/async-handler.js";

const router = Router();

router.use(requireAuth);

router.get(
  "/me",
  asyncHandler(getCurrentUser),
);

router.patch(
  "/me",
  validateBody(updateUserSchema),
  asyncHandler(updateCurrentUser),
);

export default router;