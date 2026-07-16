import { redis } from "../../../core/cache/redis.js";

export class SubmissionCache {
  private static readonly PREFIX =
    "submission";

  private static readonly TTL =
    60 * 10;

  // ==================================================
  // Submission
  // ==================================================

  static submissionKey(
    submissionId: string
  ): string {
    return `${this.PREFIX}:${submissionId}`;
  }

  // ==================================================
  // Milestone Submissions
  // ==================================================

  static milestoneKey(
    milestoneId: string
  ): string {
    return `${this.PREFIX}:milestone:${milestoneId}`;
  }

  // ==================================================
  // Get Submission
  // ==================================================

  static async getSubmission<T>(
    submissionId: string
  ): Promise<T | null> {
    const value =
      await redis.get(
        this.submissionKey(
          submissionId
        )
      );

    return value
      ? JSON.parse(value)
      : null;
  }

  // ==================================================
  // Cache Submission
  // ==================================================

  static async setSubmission(
    submissionId: string,
    value: unknown
  ): Promise<void> {
    await redis.set(
      this.submissionKey(
        submissionId
      ),
      JSON.stringify(value),
      {
        EX: this.TTL,
      }
    );
  }

  // ==================================================
  // Get Milestone Submissions
  // ==================================================

  static async getMilestoneSubmissions<T>(
    milestoneId: string
  ): Promise<T | null> {
    const value =
      await redis.get(
        this.milestoneKey(
          milestoneId
        )
      );

    return value
      ? JSON.parse(value)
      : null;
  }

  // ==================================================
  // Cache Milestone Submissions
  // ==================================================

  static async setMilestoneSubmissions(
    milestoneId: string,
    value: unknown
  ): Promise<void> {
    await redis.set(
      this.milestoneKey(
        milestoneId
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
    milestoneId: string
  ): Promise<void> {
    await Promise.all([
  redis.del(
    this.submissionKey(
      submissionId
    )
  ),

  redis.del(
    this.milestoneKey(
      milestoneId
    )
  ),
]);
  }
}