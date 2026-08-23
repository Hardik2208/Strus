import { redis } from "../../../core/cache/redis.js";

import type {
  DisputeListResponse,
} from "../interfaces/dispute-list-response.interface.js";

import type {
  DisputeResponse,
} from "../interfaces/dispute-response.interface.js";

const DISPUTE_TTL =
  60 * 5;

export class DisputeCache {

  // ==================================================
  // Cache Key
  // ==================================================

  private static key(
    milestoneId: string,
    page: number,
    limit: number
  ): string {

    return [

      "disputes",

      milestoneId,

      page,

      limit,

    ].join(":");

  }

  // ==================================================
  // Get
  // ==================================================

  static async get(
    milestoneId: string,
    page: number,
    limit: number
  ): Promise<
    DisputeListResponse | null
  > {

    const cached =
      await redis.get(
        this.key(
          milestoneId,
          page,
          limit
        )
      );

    if (!cached) {
      return null;
    }

    return JSON.parse(
      cached
    ) as DisputeListResponse;

  }

  // ==================================================
  // Set
  // ==================================================

  static async set(
    milestoneId: string,
    page: number,
    limit: number,
    response: DisputeListResponse
  ): Promise<void> {

    await redis.setEx(

      this.key(
        milestoneId,
        page,
        limit
      ),

      DISPUTE_TTL,

      JSON.stringify(
        response
      ),

    );

  }

  // ==================================================
  // Invalidate Milestone
  // ==================================================

  static async invalidateMilestone(
    milestoneId: string
  ): Promise<void> {

    const pattern =
      `disputes:${milestoneId}:*`;

    const keys =
      await redis.keys(
        pattern
      );

    if (
      keys.length > 0
    ) {

      await redis.del(
        keys
      );

    }

  }

  // ==================================================
  // Invalidate All
  // ==================================================

  static async invalidateAll(): Promise<void> {

    const keys =
      await redis.keys(
        "disputes:*"
      );

    if (
      keys.length > 0
    ) {

      await redis.del(
        keys
      );

    }

  }

  // ==================================================
  // Dispute Cache Key
  // ==================================================

  private static disputeKey(
    disputeId: string
  ): string {

    return [

      "dispute",

      disputeId,

    ].join(":");

  }

  // ==================================================
  // Get Dispute
  // ==================================================

  static async getDispute(
    disputeId: string
  ): Promise<
    DisputeResponse | null
  > {

    const cached =
      await redis.get(
        this.disputeKey(
          disputeId
        )
      );

    if (!cached) {
      return null;
    }

    return JSON.parse(
      cached
    ) as DisputeResponse;

  }

  // ==================================================
  // Set Dispute
  // ==================================================

  static async setDispute(
    disputeId: string,
    response: DisputeResponse
  ): Promise<void> {

    await redis.setEx(

      this.disputeKey(
        disputeId
      ),

      DISPUTE_TTL,

      JSON.stringify(
        response
      ),

    );

  }

  // ==================================================
  // Invalidate Dispute
  // ==================================================

  static async invalidateDispute(
    disputeId: string
  ): Promise<void> {

    await redis.del(
      this.disputeKey(
        disputeId
      )
    );

  }

}