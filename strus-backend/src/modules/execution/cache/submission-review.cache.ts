import { redis } from "../../../core/cache/redis.js";

export class SubmissionReviewCache {
  private static readonly PREFIX =
    "submission-review";

  private static readonly TTL =
    60 * 10;

  // ==================================================
  // Pending Reviews
  // ==================================================

  static pendingReviewsKey(
    workspaceId: string
  ): string {
    return `${this.PREFIX}:workspace:${workspaceId}:pending`;
  }

  // ==================================================
  // Submission Review
  // ==================================================

  static reviewKey(
    submissionId: string
  ): string {
    return `${this.PREFIX}:submission:${submissionId}`;
  }

  // ==================================================
  // Get Pending Reviews
  // ==================================================

  static async getPendingReviews<T>(
    workspaceId: string
  ): Promise<T | null> {
    const value =
      await redis.get(
        this.pendingReviewsKey(
          workspaceId
        )
      );

    return value
      ? JSON.parse(value)
      : null;
  }

  // ==================================================
  // Cache Pending Reviews
  // ==================================================

  static async setPendingReviews(
    workspaceId: string,
    value: unknown
  ): Promise<void> {
    await redis.set(
      this.pendingReviewsKey(
        workspaceId
      ),
      JSON.stringify(value),
      {
        EX: this.TTL,
      }
    );
  }

  // ==================================================
  // Get Review
  // ==================================================

  static async getReview<T>(
    submissionId: string
  ): Promise<T | null> {
    const value =
      await redis.get(
        this.reviewKey(
          submissionId
        )
      );

    return value
      ? JSON.parse(value)
      : null;
  }

  // ==================================================
  // Cache Review
  // ==================================================

  static async setReview(
    submissionId: string,
    value: unknown
  ): Promise<void> {
    await redis.set(
      this.reviewKey(
        submissionId
      ),
      JSON.stringify(value),
      {
        EX: this.TTL,
      }
    );
  }

  // ==================================================
  // Invalidate
  // ==================================================

  static async invalidate(
    submissionId: string,
    workspaceId: string
  ): Promise<void> {
    await Promise.all([
      redis.del(
        this.reviewKey(
          submissionId
        )
      ),

      redis.del(
        this.pendingReviewsKey(
          workspaceId
        )
      ),
    ]);
  }
}