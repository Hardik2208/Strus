import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { SessionService } from "../services/session.service.js";
import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";
export class SessionController {
  // ==================================================
  // Get Active Sessions
  // ==================================================

  static async getSessions(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const sessions =
        await SessionService.getSessions(
          req.user!.id,
          req.user!.sessionId
        );

      res.status(200).json({
        success: true,
        data: {
          sessions,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================================================
  // Logout One Session
  // ==================================================

// ==================================================
// Logout One Session
// ==================================================

static async logoutSession(
  req: Request<{ sessionId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const sessionId = req.params.sessionId;

    if (!sessionId) {
    throw new AppError(
        "Session ID is required.",
        400,
        ErrorCode.SESSION_NOT_FOUND
    );
    }

    await SessionService.logoutSession(
      req.user!.id,
      sessionId!
    );

    res.status(200).json({
      success: true,
      message:
        "Session logged out successfully.",
    });
  } catch (error) {
    next(error);
  }
}

  // ==================================================
  // Logout Other Sessions
  // ==================================================

  static async logoutOtherSessions(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await SessionService.logoutOtherSessions(
        req.user!.id,
        req.user!.sessionId
      );

      res.status(200).json({
        success: true,
        message:
          "Logged out from all other devices.",
      });
    } catch (error) {
      next(error);
    }
  }
}