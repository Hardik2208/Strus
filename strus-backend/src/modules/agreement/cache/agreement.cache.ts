import { redis } from "../../../core/cache/redis.js";

const TTL = 60 * 10;

export class AgreementCache {
  // ==================================================
  // Project Agreement
  // ==================================================

  private static key(
    projectId: string
  ) {
    return `project:${projectId}:agreement`;
  }

  static async get(
    projectId: string
  ) {
    const cached = await redis.get(
      this.key(projectId)
    );

    return cached
      ? JSON.parse(cached)
      : null;
  }

  static async set(
    projectId: string,
    value: unknown
  ) {
    await redis.set(
      this.key(projectId),
      JSON.stringify(value),
      {
        EX: TTL,
      }
    );
  }

  static async invalidate(
    projectId: string
  ) {
    await redis.del(
      this.key(projectId)
    );
  }
}