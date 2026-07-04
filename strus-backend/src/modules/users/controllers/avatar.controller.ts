import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { AvatarService } from "../services/avatar.service.js";

export class AvatarController {
  // ==================================================
  // Upload Avatar
  // ==================================================

  static async upload(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const response =
        await AvatarService.upload(
          req.user.id,
          req.file
        );

      res.status(200).json({
        success: true,
        message:
          "Avatar uploaded successfully.",
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================================================
  // Delete Avatar
  // ==================================================

  static async remove(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await AvatarService.remove(
        req.user.id
      );

      res.status(200).json({
        success: true,
        message:
          "Avatar removed successfully.",
      });
    } catch (error) {
      next(error);
    }
  }
}