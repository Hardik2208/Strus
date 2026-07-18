import { redis } from "../../../core/cache/redis.js";
import { ClientDashboardWorkspacesCache } from "../../dashboard/client-dashboard-cache/workspaces.cache.js"
import type { WorkspaceResponse } from "../interfaces/workspace-response.interface.js";

export class WorkspaceCache {
  private static readonly TTL = 60 * 15;

  static key(userId: string): string {
    return `user:workspaces:${userId}`;
  }

  static async get(
    userId: string
  ): Promise<WorkspaceResponse[] | null> {
    const cached = await redis.get(
      this.key(userId)
    );

    if (!cached) {
      return null;
    }

    return JSON.parse(cached) as WorkspaceResponse[];
  }

  static async set(
    userId: string,
    data: WorkspaceResponse[]
  ): Promise<void> {
    await redis.set(
        this.key(userId),
        JSON.stringify(data),
        {
            expiration: {
            type: "EX",
            value: this.TTL,
            },
        }
        );
  }

  static async invalidate(
    userId: string
  ): Promise<void> {
    await redis.del(this.key(userId));
  }

  static workspaceKey(
  workspaceId: string
): string {
  return `workspace:${workspaceId}`;
}

static async getWorkspace(
  workspaceId: string
): Promise<WorkspaceResponse | null> {
  const cached = await redis.get(
    this.workspaceKey(workspaceId)
  );

  if (!cached) {
    return null;
  }

  return JSON.parse(cached) as WorkspaceResponse;
}

static async setWorkspace(
  workspaceId: string,
  workspace: WorkspaceResponse
): Promise<void> {
  await redis.set(
    this.workspaceKey(workspaceId),
    JSON.stringify(workspace),
    {
      EX: this.TTL,
    }
  );
}

static async invalidateWorkspace(
  workspaceId: string
): Promise<void> {
  await redis.del(
    this.workspaceKey(workspaceId)
  );
}

static async invalidateDashboard(
  userId: string
): Promise<void> {
  await ClientDashboardWorkspacesCache.invalidate(
    userId
  );
}
}