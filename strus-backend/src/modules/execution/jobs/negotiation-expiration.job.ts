import { prisma } from "../../../core/database/prisma.js";

import { logger } from "../../../core/logger/index.js";

import { NegotiationRepository } from "../../negotiation/repositories/negotiation.repository.js";
import { NegotiationService } from "../../negotiation/services/negotiation.service.js";

import { NegotiationPublisher } from "../../event/publishers/negotiation.publisher.js";

export class NegotiationExpiryJob {

  // ==================================================
  // Execute
  // ==================================================

  static async execute(): Promise<void> {

    const negotiations =
      await NegotiationRepository.findExpiredNegotiations();

    if (
      negotiations.length === 0
    ) {
      return;
    }

    logger.info(
      {
        count:
          negotiations.length,
      },
      "Running negotiation expiry job."
    );

    for (
      const negotiation
      of negotiations
    ) {

      try {

        // ==========================================
        // Expire Negotiation
        // ==========================================

        const result =
          await prisma.$transaction(
            async (tx) => {

              return NegotiationService.expireNegotiation(
                tx,
                negotiation.id
              );

            }
          );

        // ==========================================
        // Already processed / not yet expired
        // ==========================================

        if (!result) {
          continue;
        }

        // ==========================================
        // Publish Event AFTER Transaction Commit
        // ==========================================

        await NegotiationPublisher
          .publishNegotiationExpired({

            negotiationId:
              result.id,

            projectId:
              result.projectId,

            createdById:
              negotiation.initiatedById,

          });

        logger.info(
          {
            negotiationId:
              result.id,

            projectId:
              result.projectId,
          },
          "Negotiation expired and event published."
        );

      } catch (error) {

        // ==========================================
        // Isolate Failure
        // ==========================================

        logger.error(
          {
            error,

            negotiationId:
              negotiation.id,

            projectId:
              negotiation.projectId,
          },
          "Failed to expire negotiation."
        );

      }

    }

    logger.info(
      {
        processed:
          negotiations.length,
      },
      "Negotiation expiry job completed."
    );

  }

}