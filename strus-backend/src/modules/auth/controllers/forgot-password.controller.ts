import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { ForgotPasswordService } from "../services/forgot-password.service.js";
import { ResetPasswordService } from "../services/reset-password.service.js";

import { forgotPasswordSchema } from "../validators/forgot-password.schema.js";
import { verifyForgotPasswordSchema } from "../validators/verify-forgot-password.schema.js";
import { resetPasswordSchema } from "../validators/reset-password.schema.js";

export class ForgotPasswordController {
  // ==================================================
  // Send OTP
  // ==================================================

  static async forgotPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } =
        forgotPasswordSchema.parse(
          req.body
        );

      await ForgotPasswordService.sendOtp(
        email
      );

      res.status(200).json({
        success: true,
        message:
          "If an account exists, a verification code has been sent.",
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================================================
  // Verify OTP
  // ==================================================

  static async verifyOtp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data =
        verifyForgotPasswordSchema.parse(
          req.body
        );

      const resetToken =
        await ForgotPasswordService.verifyOtp(
          data.email,
          data.otp
        );

      res.status(200).json({
        success: true,
        data: {
          resetToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================================================
  // Reset Password
  // ==================================================

  static async resetPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data =
        resetPasswordSchema.parse(
          req.body
        );

      await ResetPasswordService.resetPassword(
        data.resetToken,
        data.newPassword
      );

      res.status(200).json({
        success: true,
        message:
          "Password reset successfully.",
      });
    } catch (error) {
      next(error);
    }
  }
}