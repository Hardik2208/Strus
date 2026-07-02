import crypto from "node:crypto";

export class OtpUtil {
  static generate(): string {
    return Math.floor(
      100000 + Math.random() * 900000
    ).toString();
  }

  static hash(otp: string): string {
    return crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");
  }

  static verify(
    otp: string,
    hash: string
  ): boolean {
    return this.hash(otp) === hash;
  }
}