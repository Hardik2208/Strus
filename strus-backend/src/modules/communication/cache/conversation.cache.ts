import { redis } from "../../../core/cache/redis.js";

import type { ConversationResponse } from "../interfaces/conversation-response.interface.js";

export type ProjectConversationMetadata = Pick<
  ConversationResponse,
  | "id"
  | "type"
  | "status"
  | "workspace"
  | "project"
  | "lastActivityAt"
  | "lastMessage"
>;

export class CommunicationCache {
  private static readonly TTL = 60 * 15;

  // Keep your existing Workspace cache methods here unchanged.

  // ==================================================
  // Project Conversation Metadata
  // ==================================================

  static projectKey(projectId: string): string {
    return `project:conversation:${projectId}`;
  }

  static async getProjectConversationMetadata(
    projectId: string
  ): Promise<ProjectConversationMetadata | null> {
    const cached = await redis.get(
      this.projectKey(projectId)
    );

    if (!cached) {
      return null;
    }

    try {
      return JSON.parse(
        cached
      ) as ProjectConversationMetadata;
    } catch {
      await this.invalidateProjectConversation(
        projectId
      );

      return null;
    }
  }

  static async setProjectConversationMetadata(
    projectId: string,
    metadata: ProjectConversationMetadata
  ): Promise<void> {
    await redis.set(
      this.projectKey(projectId),
      JSON.stringify(metadata),
      {
        expiration: {
          type: "EX",
          value: this.TTL,
        },
      }
    );
  }

  static async invalidateProjectConversation(
    projectId: string
  ): Promise<void> {
    await redis.del(
      this.projectKey(projectId)
    );
  }

  // ==================================================
  // Workspace Conversation
  // ==================================================

  static workspaceKey(
    workspaceId: string
  ): string {
    return `workspace:conversation:${workspaceId}`;
  }

  static async getWorkspaceConversation(
    workspaceId: string
  ): Promise<ConversationResponse | null> {
    const cached = await redis.get(
      this.workspaceKey(workspaceId)
    );

    if (!cached) {
      return null;
    }

    return JSON.parse(
      cached
    ) as ConversationResponse;
  }

  static async setWorkspaceConversation(
    workspaceId: string,
    conversation: ConversationResponse
  ): Promise<void> {
    await redis.set(
      this.workspaceKey(workspaceId),
      JSON.stringify(conversation),
      {
        expiration: {
          type: "EX",
          value: this.TTL,
        },
      }
    );
  }

  static async invalidateWorkspaceConversation(
    workspaceId: string
  ): Promise<void> {
    await redis.del(
      this.workspaceKey(workspaceId)
    );
  }

  static async invalidateConversation(
  conversation: {
    workspaceId: string | null;
    projectId: string | null;
  }
): Promise<void> {
  const operations: Promise<void>[] = [];

  if (conversation.workspaceId) {
    operations.push(
      this.invalidateWorkspaceConversation(
        conversation.workspaceId
      )
    );
  }

  if (conversation.projectId) {
    operations.push(
      this.invalidateProjectConversation(
        conversation.projectId
      )
    );
  }

  await Promise.all(operations);
}
}