import type {
  NextFunction,
  Response,
} from "express";

import type { AuthenticatedRequest } from "../../auth/interfaces/auth.interface.js";

import { ProfessionalDashboardService } from "../services/professional-dashboard.service.js";

export class ProfessionalDashboardController {
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
        await ProfessionalDashboardService.getOverview(
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
  // Active Projects
  // ==================================================

  static async getActiveProjects(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId =
        req.user.id;

      const projects =
        await ProfessionalDashboardService.getActiveProjects(
          userId
        );

      res.status(200).json({
        success: true,

        data: projects,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================================================
  // Quick Actions
  // ==================================================

  static async getQuickActions(
    _req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const actions =
        ProfessionalDashboardService.getQuickActions();

      res.status(200).json({
        success: true,

        data: actions,
      });
    } catch (error) {
      next(error);
    }
  }
}