import { redis } from "../../../core/cache/redis.js";

const TTL = 60 * 10;

export class AgreementAuditCache {
  private static key(
    agreementId: string,
    queryHash: string
  ) {
    return `agreement:${agreementId}:audits:${queryHash}`;
  }

  static async get(
    agreementId: string,
    queryHash: string
  ) {
    const cached = await redis.get(
      this.key(agreementId, queryHash)
    );

    return cached
      ? JSON.parse(cached)
      : null;
  }

  static async set(
    agreementId: string,
    queryHash: string,
    value: unknown
  ) {
    await redis.set(
      this.key(agreementId, queryHash),
      JSON.stringify(value),
      {
        EX: TTL,
      }
    );
  }

  static async invalidate(
    agreementId: string
  ) {
    const keys = await redis.keys(
      `agreement:${agreementId}:audits:*`
    );

    if (keys.length > 0) {
      await redis.del(keys);
    }
  }
}