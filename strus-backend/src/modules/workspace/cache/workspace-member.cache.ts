import { redis } from "../../../core/cache/redis.js";

import type { MemberListResponse } from "../interfaces/member-list-response.interface.js";

export class WorkspaceMemberCache {
  private static readonly TTL = 60 * 15;

  private static key(
    workspaceId: string,
    page: number,
    limit: number,
    search?: string
  ): string {
    return [
      "workspace",
      workspaceId,
      "members",
      page,
      limit,
      search ?? "",
    ].join(":");
  }

  static async get(
    workspaceId: string,
    page: number,
    limit: number,
    search?: string
  ): Promise<MemberListResponse | null> {
    const cached = await redis.get(
      this.key(
        workspaceId,
        page,
        limit,
        search
      )
    );

    if (!cached) {
      return null;
    }

    return JSON.parse(
      cached
    ) as MemberListResponse;
  }

  static async set(
    workspaceId: string,
    page: number,
    limit: number,
    search: string | undefined,
    data: MemberListResponse
  ): Promise<void> {
    await redis.set(
      this.key(
        workspaceId,
        page,
        limit,
        search
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
      `workspace:${workspaceId}:members:*`;

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