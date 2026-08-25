import type { Request, Response } from "express";
import { env } from "../../config/env.js";
import * as authService from "./auth.service.js";
import type { LoginInput, RegisterInput } from "./auth.schema.js";

const cookieOptions = {
  httpOnly: true,
  sameSite: "none" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

export async function register(
  req: Request<{}, {}, RegisterInput>,
  res: Response,
) {
  const result = await authService.register(req.body);
  res.cookie("access_token", result.token, cookieOptions);
  return res.status(201).json({
    success: true,
    data: {
      user: result.user,
    },
  });
}

export async function login(req: Request<{}, {}, LoginInput>, res: Response) {
  const result = await authService.login(req.body);
  res.cookie("access_token", result.token, cookieOptions);

  return res.status(200).json({
    success: true,
    data: {
      user: result.user,
    },
  });
}

export function logout(_req: Request, res: Response) {
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "none" as const,
    path: "/",
  });

  return res.status(200).json({
    success: true,
    data: {
      message: "Logged out successfully",
    },
  });
}
