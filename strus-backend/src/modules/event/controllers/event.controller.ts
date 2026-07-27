import type {
  NextFunction,
  Response,
} from "express";

import type {
  AuthenticatedRequest,
} from "../../auth/interfaces/auth.interface.js";

import { StatusCodes } from "http-status-codes";

import { EventService } from "../services/event.service.js";

import {
  GetClientDashboardActivitiesSchema,
} from "../dtos/get-client-dashboard-activities.dto.js";

import {
  GetProfessionalDashboardActivitiesSchema,
} from "../dtos/get-professional-dashboard-activities.dto.js";

export class EventController {
  // ==================================================
  // Client Dashboard Activities
  // ==================================================

  static async getClientDashboardActivities(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user.id;

      const {
        limit,
        cursor,
      } =
        GetClientDashboardActivitiesSchema.parse(
          req.query
        );

      const activities =
        await EventService.getClientDashboardActivities(
          userId,
          limit,
          cursor
        );

      res
        .status(StatusCodes.OK)
        .json({
          success: true,
          data: activities,
        });
    } catch (error) {
      next(error);
    }
  }

  // ==================================================
  // Professional Dashboard Activities
  // ==================================================

  static async getProfessionalDashboardActivities(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user.id;

      const {
        limit,
        cursor,
      } =
        GetProfessionalDashboardActivitiesSchema.parse(
          req.query
        );

      const activities =
        await EventService.getProfessionalDashboardActivities(
          userId,
          limit,
          cursor
        );

      res
        .status(StatusCodes.OK)
        .json({
          success: true,
          data: activities,
        });
    } catch (error) {
      next(error);
    }
  }
}