import type {
  RevisionRequest,
  User,
  UserProfile,
} from "../../../generated/prisma/client.js";

type RequestedByUser = User & {
  profile: UserProfile | null;
};

export class RevisionRequestMapper {
  // ==================================================
  // Response
  // ==================================================

  static toResponse(
    revision: RevisionRequest & {
      requestedBy: RequestedByUser;
    }
  ) {
    return {
      id: revision.id,

      submissionId:
        revision.submissionId,

      milestoneId:
        revision.milestoneId,

      revisionNumber:
        revision.revisionNumber,

      content:
        revision.content,

      requestedAt:
        revision.createdAt,

      requestedBy: {
        id:
          revision.requestedBy.id,

        firstName:
          revision.requestedBy
            .profile?.firstName,

        lastName:
          revision.requestedBy
            .profile?.lastName,

        username:
          revision.requestedBy
            .profile?.username,
      },

      createdAt:
        revision.createdAt,

      updatedAt:
        revision.updatedAt,
    };
  }

  // ==================================================
  // Collection
  // ==================================================

  static toResponseList(
    revisions: Array<
      RevisionRequest & {
        requestedBy: RequestedByUser;
      }
    >
  ) {
    return revisions.map(
      (revision) =>
        this.toResponse(revision)
    );
  }
}