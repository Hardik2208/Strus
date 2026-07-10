import type { AgreementAudit } from "../../../generated/prisma/client.js";

export class AgreementAuditMapper {
  static toResponse(audit: any) {
    return {
      id: audit.id,
      agreementId: audit.agreementId,
      actorId: audit.actorId,
      action: audit.action,
      metadata: audit.metadata,
      createdAt: audit.createdAt,
      actor: audit.actor
        ? {
            id: audit.actor.id,
            profile: audit.actor.profile,
          }
        : null,
    };
  }

  static toResponseList(audits: any[]) {
    return audits.map(this.toResponse);
  }
}