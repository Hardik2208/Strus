import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { GoogleService } from "./google.service.js";

import { googleLoginSchema } from "../validators/google-login.schema.js";

export class GoogleController {
  // ==================================================
  // Google Login
  // ==================================================

  static async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data =
        googleLoginSchema.parse(
          req.body
        );

      const auth =
        await GoogleService.login(
          data.idToken,
          {
            deviceIdentifier:
              data.deviceIdentifier,

            deviceName:
              data.deviceName,

            platform:
              data.platform,

            browser:
              data.browser,

            operatingSystem:
              data.operatingSystem,
          }
        );

      res.status(200).json({
        success: true,

        message:
          "Google login successful.",

        data: auth,
      });
    } catch (error) {
      next(error);
    }
  }
}