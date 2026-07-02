import bcrypt from "bcrypt";

import { env } from "../../../core/config/env.js";

export class PasswordUtil {
  // ==================================================
  // Hash Password
  // ==================================================

  static async hash(
    password: string
  ): Promise<string> {
    return bcrypt.hash(
      password,
      env.BCRYPT_ROUNDS
    );
  }

  // ==================================================
  // Verify Password
  // ==================================================

  static async verify(
    password: string,
    hash: string
  ): Promise<boolean> {
    return bcrypt.compare(
      password,
      hash
    );
  }
}