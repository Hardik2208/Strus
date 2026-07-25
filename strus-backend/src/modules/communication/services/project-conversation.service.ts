import type { Prisma, Conversation } from "../../../generated/prisma/client.js";
import { ConversationStatus } from "../../../generated/prisma/client.js";
import { ConversationParticipantRepository } from "../repositories/conversation-participant.repository.js";
import { ConversationRepository } from "../repositories/conversation.repository.js";
import {
  AgreementInvitationStatus,
  AgreementParticipantRole,
  ProjectStatus,
} from "../../../generated/prisma/enums.js";
import { AgreementParticipantRepository } from "../../agreement/repositories/agreement-participant.repository.js";

export class ProjectConversationService {
  static async activate(
  tx: Prisma.TransactionClient,
  projectId: string
) {
  const existingConversation =
    await ConversationRepository.findProjectConversation(
      tx,
      projectId
    );

  if (existingConversation) {
    return existingConversation;
  }

  return ConversationRepository.createProjectConversation(
    tx,
    projectId
  );
}

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

  static async syncParticipants(
  tx: Prisma.TransactionClient,
  agreementId: string
): Promise<void> {
  // ==================================================
  // Load Agreement
  // ==================================================

  const agreement =
    await AgreementParticipantRepository.findForConversationSync(
      agreementId
    );

  if (!agreement) {
    return;
  }

  // ==================================================
  // Project Must Be Active
  // ==================================================

  if (
    agreement.project.status !==
    ProjectStatus.ACTIVE
  ) {
    return;
  }

  // ==================================================
  // Load Project Conversation
  // ==================================================

  const conversation =
    await ConversationRepository.findProjectConversation(
      tx,
      agreement.project.id
    );

  if (!conversation) {
    return;
  }

  // ==================================================
// Determine Expected Participants
// ==================================================

const expectedUserIds =
  agreement.participants
    .filter(participant => {
      if (
        participant.role ===
        AgreementParticipantRole.CLIENT
      ) {
        return true;
      }

      return (
        participant.role ===
          AgreementParticipantRole.PROFESSIONAL &&
        participant.invitationStatus ===
          AgreementInvitationStatus.ACCEPTED
      );
    })
    .map(participant => participant.userId);

    // ==================================================
// Load Existing Participants
// ==================================================

const existingParticipants =
  await ConversationParticipantRepository.findParticipants(
    tx,
    conversation.id
  );

const existingUserIds =
  existingParticipants.map(
    participant => participant.userId
  );

  // ==================================================
// Calculate Participant Changes
// ==================================================

const usersToAdd =
  expectedUserIds.filter(
    userId =>
      !existingUserIds.includes(userId)
  );

const usersToRemove =
  existingUserIds.filter(
    userId =>
      !expectedUserIds.includes(userId)
  );

  // ==================================================
// Add Participants
// ==================================================

await ConversationParticipantRepository.createMany(
  tx,
  usersToAdd.map(userId => ({
    conversationId: conversation.id,
    userId,
  }))
);

// ==================================================
// Remove Participants
// ==================================================

await ConversationParticipantRepository.deleteMany(
  tx,
  conversation.id,
  usersToRemove
);
}
}