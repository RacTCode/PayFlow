import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./modules/auth/auth.routes.js";
import transactionRoutes from "./modules/transactions/transaction.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { globalRateLimiter } from "./middleware/rate-limit.middleware.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(globalRateLimiter);

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);

app.use(errorHandler);

export default app;