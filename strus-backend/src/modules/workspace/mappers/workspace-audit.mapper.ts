import type { WorkspaceAuditLog } from "../../../generated/prisma/client.js";

import type { WorkspaceAuditResponse } from "../interfaces/workspace-audit-response.interface.js";

type WorkspaceAuditWithActor =
  WorkspaceAuditLog & {
    actor: {
      id: string;

      profile: {
        username: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
      } | null;
    };
  };

export class WorkspaceAuditMapper {
  static toResponse(
    log: WorkspaceAuditWithActor
  ): WorkspaceAuditResponse {
    if (!log.actor.profile) {
      throw new Error(
        "Actor profile not found."
      );
    }

    return {
      id: log.id,

      action: log.action,

      actor: {
        id: log.actor.id,

        username:
          log.actor.profile.username,

        firstName:
          log.actor.profile.firstName,

        lastName:
          log.actor.profile.lastName,

        avatarUrl:
          log.actor.profile.avatarUrl,
      },

      entityId: log.entityId,

      metadata: log.metadata,

      createdAt: log.createdAt,
    };
  }

  static toResponseList(
    logs: WorkspaceAuditWithActor[]
  ): WorkspaceAuditResponse[] {
    return logs.map((log) =>
      this.toResponse(log)
    );
  }
}