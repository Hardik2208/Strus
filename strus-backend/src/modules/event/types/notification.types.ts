/**
 * Event Notification Queue Types
 */

export enum NotificationJobType {

  // ==========================================
  // Workspace
  // ==========================================

  WORKSPACE_CREATED = "WORKSPACE_CREATED",
  WORKSPACE_DELETED = "WORKSPACE_DELETED",
  WORKSPACE_MEMBER_JOINED = "WORKSPACE_MEMBER_JOINED",
  WORKSPACE_MEMBER_REMOVED = "WORKSPACE_MEMBER_REMOVED",
  WORKSPACE_MEMBER_LEFT = "WORKSPACE_MEMBER_LEFT",
  WORKSPACE_OWNERSHIP_TRANSFERRED = "WORKSPACE_OWNERSHIP_TRANSFERRED",

  // ==========================================
  // Project
  // ==========================================

  PROJECT_CREATED = "PROJECT_CREATED",
  PROJECT_UPDATED = "PROJECT_UPDATED",
  PROJECT_ACTIVATED = "PROJECT_ACTIVATED",
  PROJECT_COMPLETED = "PROJECT_COMPLETED",
  PROJECT_DELETED = "PROJECT_DELETED",
  PROJECT_TRANSFERRED = "PROJECT_TRANSFERRED",

  // ======================================================
  // Agreement
  // ======================================================

  AGREEMENT_CREATED = "AGREEMENT_CREATED",
  AGREEMENT_UPDATED = "AGREEMENT_UPDATED",
  AGREEMENT_PROFESSIONAL_INVITED = "AGREEMENT_PROFESSIONAL_INVITED",
  AGREEMENT_INVITATION_ACCEPTED = "AGREEMENT_INVITATION_ACCEPTED",
  AGREEMENT_INVITATION_DECLINED = "AGREEMENT_INVITATION_DECLINED",
  AGREEMENT_INVITATION_WITHDRAWN = "AGREEMENT_INVITATION_WITHDRAWN",
  AGREEMENT_PROFESSIONAL_REMOVED = "AGREEMENT_PROFESSIONAL_REMOVED",

  // ======================================================
  // Execution
  // ======================================================

  EXECUTION_PLAN_CREATED = "EXECUTION_PLAN_CREATED",
  EXECUTION_PLAN_UPDATED = "EXECUTION_PLAN_UPDATED",

  PROJECT_ASSET_SHARED = "PROJECT_ASSET_SHARED",

  MILESTONE_STARTED = "MILESTONE_STARTED",

  SUBMISSION_CREATED = "SUBMISSION_CREATED",

  REVISION_REQUESTED = "REVISION_REQUESTED",

  EXTENSION_GRANTED = "EXTENSION_GRANTED",

  MILESTONE_COMPLETED = "MILESTONE_COMPLETED",
}

export interface WorkspaceMemberLeftJobData {
    createdById: string;

    workspaceId: string;

    leftUserId: string;
}



/**
 * Base payload shared by all notification jobs.
 */
export interface BaseNotificationPayload {
  /**
   * User who triggered the event.
   */
  createdById: string;

  /**
   * Users who should receive the notification.
   */
  recipientIds: string[];
}

/**
 * Workspace created notification payload.
 */
export interface WorkspaceCreatedJobData
  extends BaseNotificationPayload {
  workspaceId: string;

  workspaceName: string;

  workspaceType: string;

  ownerId: string;
}

/**
 * Workspace deleted notification payload.
 */
export interface WorkspaceDeletedJobData
  extends BaseNotificationPayload {
  workspaceId: string;

  workspaceName: string;
}

/**
 * Workspace member joined notification payload.
 *
 * Recipient resolution happens asynchronously.
 */
export interface WorkspaceMemberJoinedJobData {
  createdById: string;

  workspaceId: string;

  joinedUserId: string;
}

/**
 * Workspace member removed notification payload.
 *
 * Recipient resolution happens asynchronously.
 */
export interface WorkspaceMemberRemovedJobData {
  createdById: string;

  workspaceId: string;

  removedUserId: string;
}

/**
 * Workspace ownership transferred notification payload.
 */
export interface WorkspaceOwnershipTransferredJobData {
  workspaceId: string;

  previousOwnerId: string;

  newOwnerId: string;

  createdById: string;
}

// ======================================================
// Project Notification Payloads
// ======================================================

export interface ProjectCreatedJobData {
  createdById: string;
  projectId: string;
}

export interface ProjectUpdatedJobData {
  createdById: string;
  projectId: string;
}

export interface ProjectActivatedJobData {
  createdById: string;
  projectId: string;
}

export interface ProjectCompletedJobData {
  createdById: string;
  projectId: string;
}

export interface ProjectDeletedJobData {
  createdById: string;
  projectId: string;
  projectTitle: string;
  workspaceId: string;
  clientRecipientIds: string[];
  professionalRecipientIds: string[];
}

export interface ProjectTransferredJobData {
  createdById: string;

  projectId: string;

  previousWorkspaceId: string;

  destinationWorkspaceId: string;
}

// ======================================================
// Agreement Notification Payloads
// ======================================================

export interface AgreementCreatedJobData {
  createdById: string;

  projectId: string;

  agreementId: string;
}

export interface AgreementUpdatedJobData {
  createdById: string;

  projectId: string;

  agreementId: string;
}

export interface AgreementProfessionalInvitedJobData {
  createdById: string;

  projectId: string;

  agreementId: string;

  participantId: string;
}

export interface AgreementInvitationAcceptedJobData {
  createdById: string;

  projectId: string;

  agreementId: string;

  participantId: string;
}

export interface AgreementInvitationDeclinedJobData {
  createdById: string;

  projectId: string;

  agreementId: string;

  participantId: string;
}

export interface AgreementInvitationWithdrawnJobData {
  createdById: string;

  projectId: string;

  agreementId: string;

  participantId: string;
}

export interface AgreementProfessionalRemovedJobData {
  createdById: string;

  projectId: string;

  agreementId: string;

  participantId: string;
}

export interface ExecutionPlanCreatedPayload {
  createdById: string;
  projectId: string;
}

export interface ExecutionPlanUpdatedPayload {
  createdById: string;
  projectId: string;
}

export interface ProjectAssetSharedPayload {
  createdById: string;
  projectId: string;
  projectAssetId: string;
}export interface MilestoneStartedPayload {
  createdById: string;
  projectId: string;
  milestoneId: string;
  agreementParticipantId: string;
}

export interface MilestoneCompletedPayload {
  createdById: string;
  projectId: string;
  milestoneId: string;
  agreementParticipantId: string;
}

export interface MilestoneStartedPayload {
  createdById: string;
  projectId: string;
  milestoneId: string;
  agreementParticipantId: string;
}

export interface MilestoneCompletedPayload {
  createdById: string;
  projectId: string;
  milestoneId: string;
  agreementParticipantId: string;
}

export interface SubmissionCreatedPayload {
  createdById: string;
  projectId: string;
  milestoneId: string;
  submissionId: string;
  agreementParticipantId: string;
}

export interface RevisionRequestedPayload {
  createdById: string;
  projectId: string;
  milestoneId: string;
  revisionRequestId: string;
  agreementParticipantId: string;
}

export interface ExtensionGrantedPayload {
  createdById: string;
  projectId: string;
  milestoneId: string;
  extensionId: string;
  agreementParticipantId: string;
}

/**
 * Notification payload mapping.
 */
export interface NotificationPayloadMap {
  [NotificationJobType.WORKSPACE_CREATED]:
    WorkspaceCreatedJobData;

  [NotificationJobType.WORKSPACE_DELETED]:
    WorkspaceDeletedJobData;

  [NotificationJobType.WORKSPACE_MEMBER_JOINED]:
    WorkspaceMemberJoinedJobData;

  [NotificationJobType.WORKSPACE_MEMBER_REMOVED]:
    WorkspaceMemberRemovedJobData;

  [NotificationJobType.WORKSPACE_MEMBER_LEFT]:
    WorkspaceMemberLeftJobData;

  [NotificationJobType.WORKSPACE_OWNERSHIP_TRANSFERRED]:
    WorkspaceOwnershipTransferredJobData;

  // ======================================================
  // Project
  // ======================================================

  [NotificationJobType.PROJECT_CREATED]:
    ProjectCreatedJobData;

  [NotificationJobType.PROJECT_UPDATED]:
    ProjectUpdatedJobData;

  [NotificationJobType.PROJECT_ACTIVATED]:
    ProjectActivatedJobData;

  [NotificationJobType.PROJECT_COMPLETED]:
    ProjectCompletedJobData;

  [NotificationJobType.PROJECT_DELETED]:
    ProjectDeletedJobData;

  [NotificationJobType.PROJECT_TRANSFERRED]:
    ProjectTransferredJobData;

    // ======================================================
// Agreement
// ======================================================

[NotificationJobType.AGREEMENT_CREATED]:
  AgreementCreatedJobData;

[NotificationJobType.AGREEMENT_UPDATED]:
  AgreementUpdatedJobData;

[NotificationJobType.AGREEMENT_PROFESSIONAL_INVITED]:
  AgreementProfessionalInvitedJobData;

[NotificationJobType.AGREEMENT_INVITATION_ACCEPTED]:
  AgreementInvitationAcceptedJobData;

[NotificationJobType.AGREEMENT_INVITATION_DECLINED]:
  AgreementInvitationDeclinedJobData;

[NotificationJobType.AGREEMENT_INVITATION_WITHDRAWN]:
  AgreementInvitationWithdrawnJobData;

[NotificationJobType.AGREEMENT_PROFESSIONAL_REMOVED]:
  AgreementProfessionalRemovedJobData;
}
/**
 * Notification queue job.
 */
export type NotificationJob =

  // ======================================================
  // Workspace
  // ======================================================

  | {
      type: NotificationJobType.WORKSPACE_CREATED;
      payload: WorkspaceCreatedJobData;
    }
  | {
      type: NotificationJobType.WORKSPACE_DELETED;
      payload: WorkspaceDeletedJobData;
    }
  | {
      type: NotificationJobType.WORKSPACE_MEMBER_JOINED;
      payload: WorkspaceMemberJoinedJobData;
    }
  | {
      type: NotificationJobType.WORKSPACE_MEMBER_REMOVED;
      payload: WorkspaceMemberRemovedJobData;
    }
  | {
      type: NotificationJobType.WORKSPACE_MEMBER_LEFT;
      payload: WorkspaceMemberLeftJobData;
    }
  | {
      type: NotificationJobType.WORKSPACE_OWNERSHIP_TRANSFERRED;
      payload: WorkspaceOwnershipTransferredJobData;
    }

  // ======================================================
  // Project
  // ======================================================

  | {
      type: NotificationJobType.PROJECT_CREATED;
      payload: ProjectCreatedJobData;
    }
  | {
      type: NotificationJobType.PROJECT_UPDATED;
      payload: ProjectUpdatedJobData;
    }
  | {
      type: NotificationJobType.PROJECT_ACTIVATED;
      payload: ProjectActivatedJobData;
    }
  | {
      type: NotificationJobType.PROJECT_COMPLETED;
      payload: ProjectCompletedJobData;
    }
  | {
      type: NotificationJobType.PROJECT_DELETED;
      payload: ProjectDeletedJobData;
    }
  | {
      type: NotificationJobType.PROJECT_TRANSFERRED;
      payload: ProjectTransferredJobData;
    }

  // ======================================================
  // Agreement
  // ======================================================

  | {
      type: NotificationJobType.AGREEMENT_CREATED;
      payload: AgreementCreatedJobData;
    }
  | {
      type: NotificationJobType.AGREEMENT_UPDATED;
      payload: AgreementUpdatedJobData;
    }
  | {
      type: NotificationJobType.AGREEMENT_PROFESSIONAL_INVITED;
      payload: AgreementProfessionalInvitedJobData;
    }
  | {
      type: NotificationJobType.AGREEMENT_INVITATION_ACCEPTED;
      payload: AgreementInvitationAcceptedJobData;
    }
  | {
      type: NotificationJobType.AGREEMENT_INVITATION_DECLINED;
      payload: AgreementInvitationDeclinedJobData;
    }
  | {
      type: NotificationJobType.AGREEMENT_INVITATION_WITHDRAWN;
      payload: AgreementInvitationWithdrawnJobData;
    }
  | {
      type: NotificationJobType.AGREEMENT_PROFESSIONAL_REMOVED;
      payload: AgreementProfessionalRemovedJobData;
    }

  // ======================================================
  // Execution
  // ======================================================

  | {
      type: NotificationJobType.EXECUTION_PLAN_CREATED;
      payload: ExecutionPlanCreatedPayload;
    }
  | {
      type: NotificationJobType.EXECUTION_PLAN_UPDATED;
      payload: ExecutionPlanUpdatedPayload;
    }
  | {
      type: NotificationJobType.PROJECT_ASSET_SHARED;
      payload: ProjectAssetSharedPayload;
    }
  | {
      type: NotificationJobType.MILESTONE_STARTED;
      payload: MilestoneStartedPayload;
    }
  | {
      type: NotificationJobType.SUBMISSION_CREATED;
      payload: SubmissionCreatedPayload;
    }
  | {
      type: NotificationJobType.REVISION_REQUESTED;
      payload: RevisionRequestedPayload;
    }
  | {
      type: NotificationJobType.EXTENSION_GRANTED;
      payload: ExtensionGrantedPayload;
    }
  | {
      type: NotificationJobType.MILESTONE_COMPLETED;
      payload: MilestoneCompletedPayload;
    };