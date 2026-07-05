import { redis } from "../../../core/cache/redis.js";

import type { InvitationListResponse } from "../interfaces/invitation-list-response.interface.js";

export class WorkspaceInvitationCache {
  private static readonly TTL = 60 * 15;

  private static key(
    workspaceId: string,
    page: number,
    limit: number
  ): string {
    return [
      "workspace",
      workspaceId,
      "invitations",
      page,
      limit,
    ].join(":");
  }

  static async get(
    workspaceId: string,
    page: number,
    limit: number
  ): Promise<InvitationListResponse | null> {
    const cached = await redis.get(
      this.key(
        workspaceId,
        page,
        limit
      )
    );

    if (!cached) {
      return null;
    }

    return JSON.parse(
      cached
    ) as InvitationListResponse;
  }

  static async set(
    workspaceId: string,
    page: number,
    limit: number,
    data: InvitationListResponse
  ): Promise<void> {
    await redis.set(
      this.key(
        workspaceId,
        page,
        limit
      ),
      JSON.stringify(data),
      {
        EX: this.TTL,
      }
    );
  }

  static async invalidateWorkspace(
    workspaceId: string
  ): Promise<void> {
    const pattern =
      `workspace:${workspaceId}:invitations:*`;

    const keys: string[] = [];

    for await (const key of redis.scanIterator({
  MATCH: pattern,
})) {
  if (Array.isArray(key)) {
    keys.push(...key);
  } else {
    keys.push(key);
  }
}

    if (keys.length) {
      await redis.del(keys);
    }
  }
}