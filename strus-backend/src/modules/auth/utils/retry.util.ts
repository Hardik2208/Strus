import { AuthConstants } from "../constants/auth.constants.js";

export class RetryUtil {
  // ==================================================
  // Next Retry Time
  // ==================================================

  static nextRetryTime(
    resendCount: number
  ): Date {
    const backoff =
      AuthConstants.RESEND_BACKOFF_MINUTES;

    const index = Math.min(
      resendCount,
      backoff.length - 1
    );

    const wait =
      backoff[index] ?? backoff[backoff.length - 1]!;

    return new Date(
      Date.now() + wait * 60_000
    );
  }

  // ==================================================
  // Can Retry
  // ==================================================

  static canRetry(
    nextRetryAt: string
  ): boolean {
    return (
      new Date() >=
      new Date(nextRetryAt)
    );
  }

  // ==================================================
  // Retry After
  // ==================================================

  static retryAfterSeconds(
    nextRetryAt: string
  ): number {
    return Math.max(
      0,
      Math.ceil(
        (new Date(nextRetryAt).getTime() -
          Date.now()) /
          1000
      )
    );
  }
}