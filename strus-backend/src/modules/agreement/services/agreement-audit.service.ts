import { AgreementAuditRepository } from "../repositories/agreement-audit.repository.js";
import { AgreementPermissionService } from "./agreement-permission.service.js";
import { AgreementRepository } from "../repositories/agreement.repository.js";
import type { ListAgreementAuditsDto } from "../dtos/list-agreement-audits.dto.js";
import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";


export class AgreementAuditService {
  static async getAgreementAudits(
  projectId: string,
  userId: string,
  query: ListAgreementAuditsDto
) {
  const agreement =
    await AgreementRepository.findByProjectId(
      projectId
    );

  if (!agreement) {
    throw new AppError(
      "Agreement not found.",
      404,
      ErrorCode.AGREEMENT_NOT_FOUND
    );
  }

  AgreementPermissionService.ensureAgreementAccess(
    agreement,
    userId
  );

  return AgreementAuditRepository.findByAgreement(
    agreement.id,
    query
  );
}
}