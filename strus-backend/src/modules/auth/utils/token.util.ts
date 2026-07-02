import crypto from "node:crypto";

export class TokenUtil {
  static hash(
    token: string
  ): string {
    return crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
  }
}