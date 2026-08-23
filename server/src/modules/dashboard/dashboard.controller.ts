import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";

import * as dashboardService from "./dashboard.service.js";

export async function getDashboard(
  req: Request,
  res: Response,
) {
  const merchantId =
    (req as AuthenticatedRequest).user.id;

  const dashboard =
    await dashboardService.getDashboard(
      merchantId,
    );

  return res.status(200).json({
    success: true,

    data: {
      dashboard,
    },
  });
}