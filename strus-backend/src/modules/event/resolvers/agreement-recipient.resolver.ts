import type {
  AgreementCreatedJobData,
  AgreementInvitationAcceptedJobData,
  AgreementInvitationDeclinedJobData,
  AgreementInvitationWithdrawnJobData,
  AgreementProfessionalInvitedJobData,
  AgreementProfessionalRemovedJobData,
  AgreementUpdatedJobData,
} from "../types/notification.types.js";

import { AgreementHelperRepository } from "../repositories/agreement-event.repository.js";

export class AgreementRecipientResolver {

  /**
   * Agreement Created
   */
  static async resolveAgreementCreated(
    data: AgreementCreatedJobData
  ) {
    return AgreementHelperRepository.getAgreementCreatedContext(
      data.agreementId
    );
  }

  /**
   * Agreement Updated
   */
  static async resolveAgreementUpdated(
    data: AgreementUpdatedJobData
  ) {
    return AgreementHelperRepository.getAgreementUpdatedContext(
      data.agreementId
    );
  }

  /**
   * Professional Invited
   */
  static async resolveProfessionalInvited(
    data: AgreementProfessionalInvitedJobData
  ) {
    return AgreementHelperRepository.getProfessionalInvitedContext(
      data.participantId
    );
  }

  /**
   * Invitation Accepted
   */
  static async resolveInvitationAccepted(
    data: AgreementInvitationAcceptedJobData
  ) {
    return AgreementHelperRepository.getInvitationAcceptedContext(
      data.participantId
    );
  }

  /**
   * Invitation Declined
   */
  static async resolveInvitationDeclined(
    data: AgreementInvitationDeclinedJobData
  ) {
    return AgreementHelperRepository.getInvitationDeclinedContext(
      data.participantId
    );
  }

  /**
   * Invitation Withdrawn
   */
  static async resolveInvitationWithdrawn(
    data: AgreementInvitationWithdrawnJobData
  ) {
    return AgreementHelperRepository.getInvitationWithdrawnContext(
      data.participantId
    );
  }

  /**
   * Professional Removed
   */
  static async resolveProfessionalRemoved(
    data: AgreementProfessionalRemovedJobData
  ) {
    return AgreementHelperRepository.getProfessionalRemovedContext(
      data.participantId
    );
  }

}