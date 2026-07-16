import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";

export class SubmissionValidator {
  private static readonly MAX_CONTENT_LENGTH =
    10000;

  private static readonly MAX_ATTACHMENTS =
    10;

  private static readonly MAX_TOTAL_UPLOAD_SIZE =
    300 * 1024 * 1024;

  // ==================================================
  // Submission
  // ==================================================

  static validate(
  content: string | undefined,
  files?: Express.Multer.File[]
): void {
  const attachments = files ?? [];

  this.validateContent(content);

  this.validateAttachments(attachments);

  if (
    (!content || content.trim().length === 0) &&
    attachments.length === 0
  ) {
    throw new AppError(
      "Submission must contain content or at least one attachment.",
      400,
      ErrorCode.INVALID_SUBMISSION
    );
  }
}

  // ==================================================
  // Content
  // ==================================================

  static validateContent(
    content?: string
  ): void {
    if (!content) {
      return;
    }

    const trimmed =
      content.trim();

    if (
      trimmed.length >
      this.MAX_CONTENT_LENGTH
    ) {
      throw new AppError(
        `Content cannot exceed ${this.MAX_CONTENT_LENGTH} characters.`,
        400,
        ErrorCode.INVALID_SUBMISSION
      );
    }
  }

  // ==================================================
  // Attachments
  // ==================================================

  static validateAttachments(
  files?: Express.Multer.File[]
): void {
  const attachments = files ?? [];

  if (
    attachments.length >
    this.MAX_ATTACHMENTS
  ) {
    throw new AppError(
      `Maximum ${this.MAX_ATTACHMENTS} attachments are allowed.`,
      400,
      ErrorCode.INVALID_SUBMISSION
    );
  }

  const totalSize = attachments.reduce(
    (sum, file) => sum + file.size,
    0
  );

  if (
    totalSize >
    this.MAX_TOTAL_UPLOAD_SIZE
  ) {
    throw new AppError(
      "Total attachment size cannot exceed 300 MB.",
      400,
      ErrorCode.INVALID_SUBMISSION
    );
  }

  const uniqueAttachments = new Set<string>();

  for (const file of attachments) {
    const key =
      `${file.originalname.trim().toLowerCase()}-${file.size}`;

    if (uniqueAttachments.has(key)) {
      throw new AppError(
        `Duplicate attachment: ${file.originalname}`,
        400,
        ErrorCode.DUPLICATE_SUBMISSION_FILE
      );
    }

    uniqueAttachments.add(key);
  }
}
}