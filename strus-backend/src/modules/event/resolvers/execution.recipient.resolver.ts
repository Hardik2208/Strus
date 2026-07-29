import { ExecutionHelperRepository } from "../repositories/execution-event.repository.js";

export class ExecutionRecipientResolver {

  // ======================================================
  // Execution Plan
  // ======================================================

  static async resolveExecutionPlanCreatedRecipients(
    projectId: string
  ) {

    return ExecutionHelperRepository.getExecutionPlanCreatedContext(
      projectId
    );

  }

  static async resolveExecutionPlanUpdatedRecipients(
    projectId: string
  ) {

    return ExecutionHelperRepository.getExecutionPlanUpdatedContext(
      projectId
    );

  }

  // ======================================================
  // Milestones
  // ======================================================

  static async resolveMilestoneStartedRecipients(
    milestoneId: string
  ) {

    return ExecutionHelperRepository.getMilestoneStartedContext(
      milestoneId
    );

  }

  static async resolveMilestoneCompletedRecipients(
    milestoneId: string
  ) {

    return ExecutionHelperRepository.getMilestoneCompletedContext(
      milestoneId
    );

  }

  // ======================================================
  // Submission
  // ======================================================

  static async resolveSubmissionCreatedRecipients(
    submissionId: string
  ) {

    return ExecutionHelperRepository.getSubmissionCreatedContext(
      submissionId
    );

  }

  // ======================================================
  // Revision
  // ======================================================

  static async resolveRevisionRequestedRecipients(
    revisionRequestId: string
  ) {

    return ExecutionHelperRepository.getRevisionRequestedContext(
      revisionRequestId
    );

  }

  // ======================================================
  // Extension
  // ======================================================

  static async resolveExtensionGrantedRecipients(
    extensionId: string
  ) {

    return ExecutionHelperRepository.getExtensionGrantedContext(
      extensionId
    );

  }

  // ======================================================
  // Project Assets
  // ======================================================

  static async resolveProjectAssetSharedRecipients(
    projectAssetId: string
  ) {

    return ExecutionHelperRepository.getProjectAssetSharedContext(
      projectAssetId
    );

  }

}