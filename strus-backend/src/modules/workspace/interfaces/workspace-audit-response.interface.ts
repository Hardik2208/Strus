import type { AuditAction } from "../../../generated/prisma/enums.js";

export interface WorkspaceAuditResponse {
  id: string;

  action: AuditAction;

  actor: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };

  entityId: string | null;

  metadata: unknown;

  createdAt: Date;
}