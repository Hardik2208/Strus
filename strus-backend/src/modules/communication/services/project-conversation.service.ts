import type { Prisma } from "../../../generated/prisma/client.js";

import {
  AgreementInvitationStatus,
  AgreementParticipantRole,
  ConversationStatus,
  ProjectStatus,
} from "../../../generated/prisma/enums.js";

import { ConversationParticipantRepository } from "../repositories/conversation-participant.repository.js";
import { ConversationRepository } from "../repositories/conversation.repository.js";
import { AgreementParticipantRepository } from "../../agreement/repositories/agreement-participant.repository.js";

export class ProjectConversationService {
  /**
   * Ensures that exactly one conversation exists for a project.
   *
   * The project creator is always the initial participant.
   * Accepted professionals are synchronized only after activation.
   *
   * Must be called inside the caller's database transaction.
   */
  static async ensureInitialized(
    tx: Prisma.TransactionClient,
    projectId: string
  ) {
    const project = await tx.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
      },

      select: {
        id: true,
        createdById: true,
        status: true,

        agreement: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!project) {
      throw new Error(
        "Cannot initialize conversation for a missing project."
      );
    }

    // The unique projectId constraint makes this concurrency-safe.
    const conversation =
      await ConversationRepository.upsertProjectConversation(
        tx,
        projectId
      );

    // The creator is the Client/Project owner.
    await ConversationParticipantRepository.createMany(
      tx,
      [
        {
          conversationId: conversation.id,
          userId: project.createdById,
        },
      ]
    );

    const terminalProjectStatuses = new Set<ProjectStatus>([
  ProjectStatus.COMPLETED,
  ProjectStatus.CANCELLED,
  ProjectStatus.MUTUALLY_TERMINATED,
  ProjectStatus.DISPUTE_TERMINATED,
]);

const isTerminalProject =
  terminalProjectStatuses.has(project.status);

    // Professionals become conversation participants only
    // when the project is active and their invitations are accepted.
    if (project.agreement) {
  await this.syncParticipants(
    tx,
    project.agreement.id
  );
}

if (
  isTerminalProject &&
  conversation.status !== ConversationStatus.READ_ONLY
) {
  await ConversationRepository.updateStatus(
    tx,
    conversation.id,
    ConversationStatus.READ_ONLY
  );
}

    return conversation;
  }

  /**
   * Called when a project becomes ACTIVE.
   */
  static async activate(
    tx: Prisma.TransactionClient,
    projectId: string
  ) {
    return this.ensureInitialized(
      tx,
      projectId
    );
  }

  /**
   * Completed projects retain their conversation history,
   * but the conversation becomes read-only.
   */
  static async complete(
    tx: Prisma.TransactionClient,
    projectId: string
  ) {
    const conversation =
      await ConversationRepository.findProjectConversation(
        tx,
        projectId
      );

    if (!conversation) {
      return;
    }

    await ConversationRepository.updateStatus(
      tx,
      conversation.id,
      ConversationStatus.READ_ONLY
    );
  }

  /**
   * Synchronizes conversation membership from the Agreement.
   *
   * Client = Agreement creator.
   * Professional = accepted Agreement participant.
   */
  static async syncParticipants(
    tx: Prisma.TransactionClient,
    agreementId: string
  ): Promise<void> {
    const agreement =
      await AgreementParticipantRepository.findForConversationSync(
        tx,
        agreementId
      );

    if (!agreement) {
      return;
    }
    const conversation =
      await ConversationRepository.findProjectConversation(
        tx,
        agreement.project.id
      );

    if (!conversation) {
      return;
    }

    const expectedUserIds = new Set<string>([
      agreement.createdById,
    ]);

    for (const participant of agreement.participants) {
      const isClient =
        participant.role ===
        AgreementParticipantRole.CLIENT;

      const isAcceptedProfessional =
        participant.role ===
          AgreementParticipantRole.PROFESSIONAL &&
        participant.invitationStatus ===
          AgreementInvitationStatus.ACCEPTED;

      if (
        isClient ||
        isAcceptedProfessional
      ) {
        expectedUserIds.add(
          participant.userId
        );
      }
    }

    const existingParticipants =
      await ConversationParticipantRepository.findParticipants(
        tx,
        conversation.id
      );

    const existingUserIds =
      existingParticipants.map(
        participant => participant.userId
      );

    const usersToAdd = [
      ...expectedUserIds,
    ].filter(
      userId =>
        !existingUserIds.includes(userId)
    );

    const usersToRemove =
      existingUserIds.filter(
        userId =>
          !expectedUserIds.has(userId)
      );

    await ConversationParticipantRepository.createMany(
      tx,
      usersToAdd.map(userId => ({
        conversationId: conversation.id,
        userId,
      }))
    );

    await ConversationParticipantRepository.deleteMany(
      tx,
      conversation.id,
      usersToRemove
    );
  }
}