import { redis } from "../../../core/cache/redis.js";

export class ProjectAssetCache {
  private static readonly PREFIX =
    "project-assets:";

  static key(projectId: string): string {
    return `${this.PREFIX}${projectId}`;
  }

  static async invalidate(
    projectId: string
  ): Promise<void> {
    await redis.del(
      this.key(projectId)
    );
  }
}