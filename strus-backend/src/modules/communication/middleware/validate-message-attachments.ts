import { fileTypeFromBuffer } from "file-type";

import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";

const MIME_MAP = new Map([
  ["jpg", "image/jpeg"],
  ["jpeg", "image/jpeg"],
  ["png", "image/png"],
  ["webp", "image/webp"],
  ["gif", "image/gif"],

  ["pdf", "application/pdf"],

  ["doc", "application/msword"],
  [
    "docx",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],

  ["xls", "application/vnd.ms-excel"],
  [
    "xlsx",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],

  ["ppt", "application/vnd.ms-powerpoint"],
  [
    "pptx",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ],
]);

export async function validateAttachments(
  files: Express.Multer.File[]
) {
  for (const file of files) {
    const detected =
      await fileTypeFromBuffer(file.buffer);

    if (!detected) {
      continue;
    }

    const expectedMime =
      MIME_MAP.get(detected.ext);

    if (!expectedMime) {
      throw new AppError(
        "Unknown file type.",
        400,
        ErrorCode.INVALID_MESSAGE_ATTACHMENT
      );
    }

    if (expectedMime !== file.mimetype) {
      throw new AppError(
        "File type mismatch.",
        400,
        ErrorCode.INVALID_MESSAGE_ATTACHMENT
      );
    }
  }
}