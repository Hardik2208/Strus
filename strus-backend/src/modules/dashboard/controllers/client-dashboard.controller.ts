import type {
  NextFunction,
  Response,
} from "express";

import type { AuthenticatedRequest } from "../../auth/interfaces/auth.interface.js";

import type { GetClientDashboardDto } from "../dtos/get-client-dashboard.dto.js";

import { ClientDashboardService } from "../services/client-dashboard.service.js";

export class ClientDashboardController {
  // ==================================================
  // Overview
  // ==================================================

  static async getOverview(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId =
        req.user.id;

      const overview =
        await ClientDashboardService.getOverview(
          userId
        );

      res.status(200).json({
        success: true,

        data: overview,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================================================
  // Workspaces
  // ==================================================

  static async getWorkspaces(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId =
        req.user.id;

      const workspaces =
        await ClientDashboardService.getWorkspaces(
          userId
        );

      res.status(200).json({
        success: true,

        data: workspaces,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================================================
  // Requires Attention
  // ==================================================

  static async getRequiresAttention(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId =
        req.user.id;

      const attention =
        await ClientDashboardService.getRequiresAttention(
          userId
        );

      res.status(200).json({
        success: true,

        data: attention,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================================================
  // Recent Activity
  // ==================================================

  static async getRecentActivity(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user.id;

    const activityLimit =
      Number(req.query.activityLimit ?? 10);

    const activity =
      await ClientDashboardService.getRecentActivity(
        userId,
        activityLimit
      );

    res.status(200).json({
      success: true,
      data: activity,
    });
  } catch (error) {
    next(error);
  }
}
}