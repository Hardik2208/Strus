import { OtpUtil } from "./otp.util.js";

import type { RegistrationSession } from "../types/registration-session.js";

export class RegistrationSessionUtil {
  static create(data: {
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
  }): {
    session: RegistrationSession;
    otp: string;
  } {
    const otp = OtpUtil.generate();

    return {
      otp,

      session: {
        version: 1,

        firstName: data.firstName,

        lastName: data.lastName,

        email: data.email,

        passwordHash: data.passwordHash,

        otpHash: OtpUtil.hash(otp),

        attemptCount: 0,

        resendCount: 0,

        nextRetryAt: new Date().toISOString(),

        createdAt: new Date().toISOString(),
      },
    };
  }
}