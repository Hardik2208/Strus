import type {
  NextFunction,
  Request,
  Response,
} from "express";
import { RefreshTokenService } from "../services/refresh-token.service.js";
import { LogoutService } from "../services/logout.service.js";
import { logoutSchema } from "../validators/logout.schema.js";
import { refreshTokenSchema } from "../validators/refresh-token.schema.js";
import { RegistrationService } from "../services/registration.service.js";
import { VerificationService } from "../services/verification.service.js";
import { LoginService } from "../services/login.service.js";

import { registerSchema } from "../validators/register.schema.js";
import { verifyEmailSchema } from "../validators/verify-email.schema.js";
import { resendOtpSchema } from "../validators/resend-otp.schema.js";
import { loginSchema } from "../validators/login.schema.js";

export class AuthController {
  // ==================================================
  // Register
  // ==================================================

  static async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data =
        registerSchema.parse(req.body);

      await RegistrationService.register(
        data
      );

      res.status(201).json({
        success: true,
        message:
          "Verification code sent successfully.",
      });
    } catch (error) {
      next(error);
    }
  }

// ==================================================
// Logout
// ==================================================

static async logout(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { refreshToken } =
      logoutSchema.parse(req.body);

    await LogoutService.logout(
      refreshToken
    );

    res.status(200).json({
      success: true,
      message:
        "Logged out successfully.",
    });
  } catch (error) {
    next(error);
  }
}

  
  // ==================================================
  // Verify Email
  // ==================================================

  static async verifyEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data =
        verifyEmailSchema.parse(req.body);

      const auth =
        await VerificationService.verify(
          data
        );

      res.status(200).json({
        success: true,
        message:
          "Email verified successfully.",
        data: auth,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================================================
  // Resend OTP
  // ==================================================

  static async resendOtp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } =
        resendOtpSchema.parse(req.body);

      await RegistrationService.resendOtp(
        email
      );

      res.status(200).json({
        success: true,
        message:
          "Verification code sent successfully.",
      });
    } catch (error) {
      next(error);
    }
  }


// ==================================================
// Refresh Token
// ==================================================

static async refreshToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { refreshToken } =
      refreshTokenSchema.parse(req.body);

    const auth =
      await RefreshTokenService.refresh(
        refreshToken
      );

    res.status(200).json({
      success: true,
      message:
        "Token refreshed successfully.",
      data: auth,
    });
  } catch (error) {
    next(error);
  }
}

  // ==================================================
  // Login
  // ==================================================

  static async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data =
        loginSchema.parse(req.body);

      const auth =
        await LoginService.login(data);

      res.status(200).json({
        success: true,
        message: "Login successful.",
        data: auth,
      });
    } catch (error) {
      next(error);
    }
  }
  
// ==================================================
// Logout All Devices
// ==================================================

static async logoutAll(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await LogoutService.logoutAll(
      req.user!.id
    );

    res.status(200).json({
      success: true,
      message:
        "Logged out from all devices.",
    });
  } catch (error) {
    next(error);
  }
}

// ==================================================
// Current User
// ==================================================

static async me(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    res.status(200).json({
      success: true,
      data: req.user!,
    });
  } catch (error) {
    next(error);
  }
}
}
