import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";

import { AuthRepository } from "../repositories/auth.repository.js";
import { PasswordRepository } from "../repositories/password.repository.js";
import { SessionRepository } from "../repositories/session.repository.js";

import { AuthEmailService } from "../email/auth-email.service.js";

import { PasswordUtil } from "../utils/password.util.js";

export class PasswordService {
  // ==================================================
  // Change Password
  // ==================================================

  static async changePassword(
    userId: string,
    currentSessionId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    // ------------------------------------------
    // Find User
    // ------------------------------------------

    const user =
      await AuthRepository.findUserById(
        userId
      );

    if (!user || !user.passwordHash) {
      throw new AppError(
        "User not found.",
        404,
        ErrorCode.USER_NOT_FOUND
      );
    }

    // ------------------------------------------
    // Verify Current Password
    // ------------------------------------------

    const valid =
      await PasswordUtil.verify(
        currentPassword,
        user.passwordHash
      );

    if (!valid) {
      throw new AppError(
        "Current password is incorrect.",
        401,
        ErrorCode.INVALID_CREDENTIALS
      );
    }

    // ------------------------------------------
    // Hash New Password
    // ------------------------------------------

    const passwordHash =
      await PasswordUtil.hash(
        newPassword
      );

    // ------------------------------------------
    // Update Password
    // ------------------------------------------

    const updatedUser =
      await PasswordRepository.updatePassword(
        userId,
        passwordHash
      );

    // ------------------------------------------
    // Logout Every Other Device
    // ------------------------------------------

    await SessionRepository.revokeOtherSessions(
      userId,
      currentSessionId
    );

    // ------------------------------------------
    // Send Security Email
    // ------------------------------------------

    void AuthEmailService
      .sendPasswordChangedEmail(
        updatedUser.email,
          "there"
      )
      .catch((error) => {
        console.error(
          "Failed to send password changed email.",
          error
        );
      });
  }
}