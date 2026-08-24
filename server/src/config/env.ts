import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(5000),

  CLIENT_URL: z.url().default("http://localhost:3000"),

  DATABASE_URL: z.string().min(1),

  JWT_SECRET: z.string().min(32),

  JWT_EXPIRES_IN: z.string().default("3d"),
});

export const env = envSchema.parse(process.env);