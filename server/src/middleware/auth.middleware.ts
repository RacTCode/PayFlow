import type { NextFunction, Request, Response } from "express";

import { verifyAccessToken } from "../utils/jwt.js";
import { AppError } from "../utils/app-error.js";

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    role: "ADMIN" | "MERCHANT";
  };
}

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const token = req.cookies.access_token;

    if (!token) {
      throw new AppError(
        "Authentication required",
        401,
        "UNAUTHORIZED",
      );
    }

    const payload = verifyAccessToken(token);

    (req as AuthenticatedRequest).user = {
      id: payload.sub,
      role: payload.role,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }

    next(
      new AppError(
        "Invalid or expired authentication token",
        401,
        "UNAUTHORIZED",
      ),
    );
  }
}

export function requireRole(
  ...allowedRoles: Array<"ADMIN" | "MERCHANT">
) {
  return (
    req: Request,
    _res: Response,
    next: NextFunction,
  ) => {
    const user = (req as AuthenticatedRequest).user;

    if (!user || !allowedRoles.includes(user.role)) {
      next(
        new AppError(
          "You do not have permission to perform this action",
          403,
          "FORBIDDEN",
        ),
      );

      return;
    }

    next();
  };
}