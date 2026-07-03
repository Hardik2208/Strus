import { Router } from "express";

import { AuthController } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { SessionController } from "../controllers/session.controller.js";
import { PasswordController } from "../controllers/password.controller.js";
import { ForgotPasswordController } from "../controllers/forgot-password.controller.js";
import googleRoutes from "../oauth/google.routes.js";

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

router.post(
  "/logout-all",
  authenticate,
  AuthController.logoutAll
);

router.get(
  "/me",
  authenticate,
  AuthController.me
);

// ==================================================
// Session Management
// ==================================================

router.get(
  "/sessions",
  authenticate,
  SessionController.getSessions
);

router.delete(
  "/sessions/others",
  authenticate,
  SessionController.logoutOtherSessions
);

router.delete(
  "/sessions/:sessionId",
  authenticate,
  SessionController.logoutSession
);

// ==================================================
// Password Management
// ==================================================

router.patch(
  "/password",
  authenticate,
  PasswordController.changePassword
);


router.post(
  "/forgot-password",
  ForgotPasswordController.forgotPassword
);

router.post(
  "/verify-forgot-password",
  ForgotPasswordController.verifyOtp
);

router.post(
  "/reset-password",
  ForgotPasswordController.resetPassword
);

router.use(
  googleRoutes
);

export default router;