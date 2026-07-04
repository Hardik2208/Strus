import { Router } from "express";

import { AvatarController } from "../controllers/avatar.controller.js";

import { authenticate } from "../../auth/middleware/auth.middleware.js";

import { uploadAvatar } from "../../../core/middleware/upload-avatar.middleware.js";

const router = Router();

router.post(
  "/me/avatar",
  authenticate,
  uploadAvatar.single("avatar"),
  AvatarController.upload
);

router.delete(
  "/me/avatar",
  authenticate,
  AvatarController.remove
);

export default router;