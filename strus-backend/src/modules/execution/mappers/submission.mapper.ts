import type {
  MilestoneSubmission,
  SubmissionAttachment,
  UserProfile,
  User,
} from "../../../generated/prisma/client.js";

type SubmissionUser = User & {
  profile: UserProfile | null;
};

export class SubmissionMapper {
  // ==================================================
  // Submission
  // ==================================================

  static toResponse(
    submission: MilestoneSubmission & {
      attachments: SubmissionAttachment[];

      submittedBy: SubmissionUser;

      reviewedBy: SubmissionUser | null;
    }
  ) {
    return {
      id: submission.id,

      submissionNumber:
        submission.submissionNumber,

      content:
        submission.content,

      status:
        submission.status,

      submittedAt:
        submission.submittedAt,

      reviewedAt:
        submission.reviewedAt,

      attachments:
        submission.attachments.map(
          (attachment) => ({
            id: attachment.id,

            originalName:
              attachment.originalName,

            url:
              attachment.url,

            mimeType:
              attachment.mimeType,

            extension:
              attachment.extension,

            attachmentType:
              attachment.attachmentType,

            size:
              Number(
                attachment.size
              ),
          })
        ),

      submittedBy:
        submission.submittedBy
          ? {
              id:
                submission.submittedBy.id,

              firstName:
                submission
                  .submittedBy
                  .profile
                  ?.firstName,

              lastName:
                submission
                  .submittedBy
                  .profile
                  ?.lastName,

              username:
                submission
                  .submittedBy
                  .profile
                  ?.username,
            }
          : null,

      reviewedBy:
        submission.reviewedBy
          ? {
              id:
                submission.reviewedBy.id,

              firstName:
                submission
                  .reviewedBy
                  .profile
                  ?.firstName,

              lastName:
                submission
                  .reviewedBy
                  .profile
                  ?.lastName,

              username:
                submission
                  .reviewedBy
                  .profile
                  ?.username,
            }
          : null,

      createdAt:
        submission.createdAt,

      updatedAt:
        submission.updatedAt,
    };
  }

  // ==================================================
  // Collection
  // ==================================================

  static toResponseList(
    submissions: Array<
      MilestoneSubmission & {
        attachments: SubmissionAttachment[];

        submittedBy: SubmissionUser;

        reviewedBy: SubmissionUser | null;
      }
    >
  ) {
    return submissions.map(
      (submission) =>
        this.toResponse(
          submission
        )
    );
  }
}