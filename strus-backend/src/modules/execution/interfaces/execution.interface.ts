import type {
  MilestoneStatus,
} from "../../../generated/prisma/enums.js";

export interface MilestoneResponse {
  id: string;

  projectId: string;

  agreementParticipantId: string;

  order: number;

  title: string;

  shortDescription: string | null;

  description: string;

  allocatedDays: number;

  carryForwardDays: number;

  extensionDays: number;

  paymentAllocation: number;

  revisionLimit: number;

  revisionCount: number;

  status: MilestoneStatus;

  startedAt: Date | null;

  submittedAt: Date | null;

  completedAt: Date | null;

  createdAt: Date;

  updatedAt: Date;
}

export interface ExecutionPlanResponse {
  milestones: MilestoneResponse[];
}