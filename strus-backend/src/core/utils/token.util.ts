import crypto from "node:crypto";

export class TokenUtil {
  /**
   * Generates a cryptographically secure random token.
   */
  static generateToken(): string {
    return crypto.randomBytes(32).toString("base64url");
  }

  /**
   * Hashes a token before storing it in the database.
   */
  static hashToken(token: string): string {
    return crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
  }
}