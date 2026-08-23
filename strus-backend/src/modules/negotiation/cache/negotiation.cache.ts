import { redis } from "../../../core/cache/redis.js";

import type {
  NegotiationListResponse,
} from "../interfaces/negotiation-list-response.interface.js";
import type {
  NegotiationResponse,
} from "../interfaces/negotiation-response.interface.js";

const NEGOTIATION_TTL =
  60 * 5;

export class NegotiationCache {

  // ==================================================
  // Cache Key
  // ==================================================

  private static key(
    milestoneId: string,
    page: number,
    limit: number
  ): string {

    return [
      "negotiations",
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
    NegotiationListResponse | null
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
    ) as NegotiationListResponse;

  }

  // ==================================================
  // Set
  // ==================================================

  static async set(
    milestoneId: string,
    page: number,
    limit: number,
    response: NegotiationListResponse
  ): Promise<void> {

    await redis.setEx(
      this.key(
        milestoneId,
        page,
        limit
      ),
      NEGOTIATION_TTL,
      JSON.stringify(response)
    );

  }

  // ==================================================
  // Invalidate Milestone
  // ==================================================

  static async invalidateMilestone(
    milestoneId: string
  ): Promise<void> {

    const pattern =
      `negotiations:${milestoneId}:*`;

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
        "negotiations:*"
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
  // Negotiation Cache Key
  // ==================================================

  private static negotiationKey(
    negotiationId: string
  ): string {

    return [
      "negotiation",
      negotiationId,
    ].join(":");

  }

    // ==================================================
  // Get Negotiation
  // ==================================================

  static async getNegotiation(
    negotiationId: string
  ): Promise<
    NegotiationResponse | null
  > {

    const cached =
      await redis.get(
        this.negotiationKey(
          negotiationId
        )
      );

    if (!cached) {
      return null;
    }

    return JSON.parse(
      cached
    ) as NegotiationResponse;

  }

    // ==================================================
  // Set Negotiation
  // ==================================================

  static async setNegotiation(
    negotiationId: string,
    response: NegotiationResponse
  ): Promise<void> {

    await redis.setEx(

      this.negotiationKey(
        negotiationId
      ),

      NEGOTIATION_TTL,

      JSON.stringify(
        response
      ),

    );

  }

    // ==================================================
  // Invalidate Negotiation
  // ==================================================

  static async invalidateNegotiation(
    negotiationId: string
  ): Promise<void> {

    await redis.del(
      this.negotiationKey(
        negotiationId
      )
    );

  }

}