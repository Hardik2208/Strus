export class ProjectAuditMapper {
  static toResponse(log: any) {
    return {
      id: log.id,

      action: log.action,

      metadata: log.metadata,

      createdAt: log.createdAt,

      actor: log.actor
        ? {
            id: log.actor.id,

            username:
              log.actor.profile?.username ??
              null,

            firstName:
              log.actor.profile?.firstName ??
              null,

            lastName:
              log.actor.profile?.lastName ??
              null,

            avatarUrl:
              log.actor.profile?.avatarUrl ??
              null,
          }
        : null,
    };
  }

  static toResponseList(logs: any[]) {
    return logs.map((log) =>
      this.toResponse(log)
    );
  }
}