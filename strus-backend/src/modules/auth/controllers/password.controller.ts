import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { PasswordService } from "../services/password.service.js";

import { changePasswordSchema } from "../validators/change-password.schema.js";

export class PasswordController {
  // ==================================================
  // Change Password
  // ==================================================

  static async changePassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        currentPassword,
        newPassword,
      } = changePasswordSchema.parse(
        req.body
      );

      await PasswordService.changePassword(
        req.user!.id,
        req.user!.sessionId,
        currentPassword,
        newPassword
      );

      res.status(200).json({
        success: true,
        message:
          "Password changed successfully.",
      });
    } catch (error) {
      next(error);
    }
  }
}