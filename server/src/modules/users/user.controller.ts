import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import * as userService from "./user.service.js";

import type { UpdateUserInput } from "./user.schema.js";

export async function getCurrentUser(
  req: Request,
  res: Response,
) {
  const user =
    (req as AuthenticatedRequest).user;

  const result =
    await userService.getUserById(user.id);

  return res.status(200).json({
    success: true,
    data: {
      user: result,
    },
  });
}

export async function updateCurrentUser(
  req: Request<{}, {}, UpdateUserInput>,
  res: Response,
) {
  const user =
    (req as AuthenticatedRequest).user;

  const result =
    await userService.updateUser(
      user.id,
      req.body,
    );

  return res.status(200).json({
    success: true,
    data: {
      user: result,
    },
  });
}