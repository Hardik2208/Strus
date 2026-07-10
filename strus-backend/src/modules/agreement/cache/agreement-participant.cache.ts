import { redis } from "../../../core/cache/redis.js";

const TTL = 60 * 10;

export class AgreementParticipantCache {
  private static key(
    agreementId: string
  ) {
    return `agreement:${agreementId}:participants`;
  }

  static async get(
    agreementId: string
  ) {
    const cached = await redis.get(
      this.key(agreementId)
    );

    return cached
      ? JSON.parse(cached)
      : null;
  }

  static async set(
    agreementId: string,
    value: unknown
  ) {
    await redis.set(
      this.key(agreementId),
      JSON.stringify(value),
      {
        EX: TTL,
      }
    );
  }

  static async invalidate(
    agreementId: string
  ) {
    await redis.del(
      this.key(agreementId)
    );
  }
}