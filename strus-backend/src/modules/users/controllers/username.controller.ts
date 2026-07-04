import type {
  Request,
  Response,
  NextFunction,
} from "express";

import { UsernameService } from "../services/username.service.js";

import type { UpdateUsernameDto } from "../dtos/update-username.dto.js";

export class UsernameController {
  // ==================================================
  // Check Username Availability
  // ==================================================

  static async checkAvailability(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const username = String(
        req.query.username ?? ""
      );

      const result =
        await UsernameService.checkAvailability(
          username
        );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================================================
  // Update Username
  // ==================================================

  static async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const dto =
        req.body as UpdateUsernameDto;

      const response =
        await UsernameService.update(
          req.user.id,
          dto
        );

      res.status(200).json({
        success: true,
        message:
          "Username updated successfully.",
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }
}