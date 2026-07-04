import { Router } from "express";

import { UsernameController } from "../controllers/username.controller.js";

import { authenticate } from "../../auth/middleware/auth.middleware.js";

const router = Router();

router.get(
  "/check-username",
  UsernameController.checkAvailability
);

router.patch(
  "/me/username",
  authenticate,
  UsernameController.update
);

export default router;