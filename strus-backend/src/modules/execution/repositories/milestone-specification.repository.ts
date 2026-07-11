import type { Prisma } from "../../../generated/prisma/client.js";

export class MilestoneSpecificationRepository {
  // ==================================================
  // Requirements
  // ==================================================

  static createRequirements(
    tx: Prisma.TransactionClient,
    data: Prisma.MilestoneRequirementCreateManyInput[]
  ) {
    return tx.milestoneRequirement.createMany({
      data,
    });
  }

  // ==================================================
  // Deliverables
  // ==================================================

  static createDeliverables(
    tx: Prisma.TransactionClient,
    data: Prisma.MilestoneDeliverableCreateManyInput[]
  ) {
    return tx.milestoneDeliverable.createMany({
      data,
    });
  }

  // ==================================================
  // Acceptance Criteria
  // ==================================================

  static createAcceptanceCriteria(
    tx: Prisma.TransactionClient,
    data: Prisma.MilestoneAcceptanceCriteriaCreateManyInput[]
  ) {
    return tx.milestoneAcceptanceCriteria.createMany({
      data,
    });
  }
}