import type { NextFunction, Request, Response } from "express";

import { ProfileService } from "../services/profile.service.js";

import type { CreateProfileDto } from "../dtos/create-profile.dto.js";

export class ProfileController {
  // ==================================================
  // Create Profile
  // ==================================================

  static async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user.id;

      const dto = req.body as CreateProfileDto;

      const profile = await ProfileService.create(
        userId,
        dto
      );

      res.status(201).json({
        success: true,
        message: "Profile created successfully.",
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const profile =
      await ProfileService.getMyProfile(
        req.user.id
      );

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
}

static async update(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const profile =
      await ProfileService.updateProfile(
        req.user.id,
        req.body
      );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
}


}