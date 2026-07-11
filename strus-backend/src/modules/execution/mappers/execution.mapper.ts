import type { Milestone } from "../../../generated/prisma/client.js";

export class ExecutionMapper {
  static toExecutionPlanResponse(
    milestones: Milestone[]
  ) {
    return milestones;
  }
}