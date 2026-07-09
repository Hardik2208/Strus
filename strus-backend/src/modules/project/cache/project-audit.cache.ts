import { redis } from "../../../core/cache/redis.js";

const TTL = 60 * 10;

export class ProjectAuditCache {
  private static key(
    projectId: string,
    queryHash: string
  ) {
    return `project:${projectId}:audits:${queryHash}`;
  }

  static async get(
    projectId: string,
    queryHash: string
  ) {
    const cached = await redis.get(
      this.key(projectId, queryHash)
    );

    return cached
      ? JSON.parse(cached)
      : null;
  }

  static async set(
    projectId: string,
    queryHash: string,
    value: unknown
  ) {
    await redis.set(
      this.key(projectId, queryHash),
      JSON.stringify(value),
      {
        EX: TTL,
      }
    );
  }

  static async invalidate(
    projectId: string
  ) {
    const keys = await redis.keys(
      `project:${projectId}:audits:*`
    );

    if (keys.length > 0) {
      await redis.del(keys);
    }
  }
}