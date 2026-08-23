import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

export interface AuthTokenPayload {
  sub: string;
  role: "ADMIN" | "MERCHANT";
}

export function signAccessToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string): AuthTokenPayload {
  return jwt.verify(
    token,
    env.JWT_SECRET,
  ) as AuthTokenPayload;
}