import { Router } from "express";

import { ProfileController } from "../controllers/profile.controller.js";

import { authenticate } from "../../auth/middleware/auth.middleware.js";

const router = Router();

/**
 * Profile Onboarding
 */
router.post(
  "/me/profile",
  authenticate,
  ProfileController.create
);

router.get(
  "/me",
  authenticate,
  ProfileController.getMyProfile
);

router.patch(
  "/me",
  authenticate,
  ProfileController.update
);

export default router;