import { redis } from "../../../core/cache/redis.js";

const TTL = 60 * 10; // 10 minutes

export class ProjectCache {
  // ==================================================
  // Single Project
  // ==================================================

  private static projectKey(
    projectId: string
  ) {
    return `project:${projectId}`;
  }

  static async get(
    projectId: string
  ) {
    const cached = await redis.get(
      this.projectKey(projectId)
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
      this.projectKey(projectId),
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
      this.projectKey(projectId)
    );
  }

  // ==================================================
  // Workspace Project List
  // ==================================================

  private static workspaceProjectsKey(
    workspaceId: string,
    queryHash: string
  ) {
    return `workspace:${workspaceId}:projects:${queryHash}`;
  }

  static async getWorkspaceProjects(
    workspaceId: string,
    queryHash: string
  ) {
    const cached = await redis.get(
      this.workspaceProjectsKey(
        workspaceId,
        queryHash
      )
    );

    return cached
      ? JSON.parse(cached)
      : null;
  }

  static async setWorkspaceProjects(
    workspaceId: string,
    queryHash: string,
    value: unknown
  ) {
    await redis.set(
      this.workspaceProjectsKey(
        workspaceId,
        queryHash
      ),
      JSON.stringify(value),
      {
        EX: TTL,
      }
    );
  }

  static async invalidateWorkspace(
    workspaceId: string
  ) {
    const keys = await redis.keys(
      `workspace:${workspaceId}:projects:*`
    );

    if (keys.length > 0) {
      await redis.del(keys);
    }
  }
}