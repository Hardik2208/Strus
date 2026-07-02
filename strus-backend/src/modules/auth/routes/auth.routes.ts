import { Router } from "express";

import { AuthController } from "../controllers/auth.controller.js";

const router = Router();

// ==================================================
// Register
// ==================================================

router.post(
  "/register",
  AuthController.register
);

// ==================================================
// Verify Email
// ==================================================

router.post(
  "/verify-email",
  AuthController.verifyEmail
);

// ==================================================
// Resend OTP
// ==================================================

router.post(
  "/resend-otp",
  AuthController.resendOtp
);

// ==================================================
// Login
// ==================================================

router.post(
  "/login",
  AuthController.login
);

// ==================================================
// Refresh Token
// ==================================================

router.post(
  "/refresh-token",
  AuthController.refreshToken
);

router.post(
  "/logout",
  AuthController.logout
);

export default router;