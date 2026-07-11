import type { Milestone } from "../../../generated/prisma/client.js";

export class MilestoneMapper {
  static toResponse(
    milestone: Milestone
  ) {
    return {
      id: milestone.id,

      projectId:
        milestone.projectId,

      agreementParticipantId:
        milestone.agreementParticipantId,

      order: milestone.order,

      allocatedDays:
        milestone.allocatedDays,

      carryForwardDays:
        milestone.carryForwardDays,

      extensionDays:
        milestone.extensionDays,

      paymentAllocation:
        milestone.paymentAllocation,

      revisionLimit:
        milestone.revisionLimit,

      revisionCount:
        milestone.revisionCount,

      status:
        milestone.status,

      startedAt:
        milestone.startedAt,

      submittedAt:
        milestone.submittedAt,

      completedAt:
        milestone.completedAt,

      createdAt:
        milestone.createdAt,

      updatedAt:
        milestone.updatedAt,
    };
  }

  static toResponseList(
    milestones: Milestone[]
  ) {
    return milestones.map((milestone) =>
      this.toResponse(
        milestone
      )
    );
  }
}