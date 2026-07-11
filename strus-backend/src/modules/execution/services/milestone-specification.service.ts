import type {
  Milestone,
  Prisma,
} from "../../../generated/prisma/client.js";

import type { CreateExecutionPlanDto } from "../dtos/create-execution-plan.dto.js";

import { MilestoneSpecificationRepository } from "../repositories/milestone-specification.repository.js";

export class MilestoneSpecificationService {
  // ==================================================
  // Create Specifications
  // ==================================================

  static async create(
    tx: Prisma.TransactionClient,
    dto: CreateExecutionPlanDto,
    milestones: Milestone[]
  ): Promise<void> {
    const milestoneMap = new Map<string, string>();

    milestones.forEach((milestone) => {
      milestoneMap.set(
        `${milestone.agreementParticipantId}-${milestone.order}`,
        milestone.id
      );
    });

    const requirements: Prisma.MilestoneRequirementCreateManyInput[] = [];

    const deliverables: Prisma.MilestoneDeliverableCreateManyInput[] = [];

    const acceptanceCriteria: Prisma.MilestoneAcceptanceCriteriaCreateManyInput[] = [];

    for (const professional of dto.professionals) {
      for (
        let milestoneIndex = 0;
        milestoneIndex <
        professional.milestones.length;
        milestoneIndex++
      ) {
        const milestone =
  professional.milestones[
    milestoneIndex
  ];

if (!milestone) {
  continue;
}

        const milestoneId =
          milestoneMap.get(
            `${professional.agreementParticipantId}-${milestoneIndex + 1}`
          );

        if (!milestoneId) {
          continue;
        }

        // ------------------------------------------
        // Requirements
        // ------------------------------------------

        milestone.requirements.forEach(
          (requirement, index) => {
            requirements.push({
              milestoneId,

              content:
                requirement.content.trim(),

              order: index + 1,
            });
          }
        );

        // ------------------------------------------
        // Deliverables
        // ------------------------------------------

        milestone.deliverables.forEach(
          (deliverable, index) => {
            deliverables.push({
              milestoneId,

              content:
                deliverable.content.trim(),

              isMandatory:
                deliverable.isMandatory,

              order: index + 1,
            });
          }
        );

        // ------------------------------------------
        // Acceptance Criteria
        // ------------------------------------------

        milestone.acceptanceCriteria.forEach(
          (criteria, index) => {
            acceptanceCriteria.push({
              milestoneId,

              content:
                criteria.content.trim(),

              order: index + 1,
            });
          }
        );
      }
    }

    if (requirements.length > 0) {
      await MilestoneSpecificationRepository.createRequirements(
        tx,
        requirements
      );
    }

    if (deliverables.length > 0) {
      await MilestoneSpecificationRepository.createDeliverables(
        tx,
        deliverables
      );
    }

    if (
      acceptanceCriteria.length > 0
    ) {
      await MilestoneSpecificationRepository.createAcceptanceCriteria(
        tx,
        acceptanceCriteria
      );
    }
  }
}