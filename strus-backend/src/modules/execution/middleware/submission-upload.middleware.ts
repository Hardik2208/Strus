import multer from "multer";

import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";

const MAX_FILE_SIZE =
  100 * 1024 * 1024;

const MAX_FILES = 20;

const ALLOWED_MIME_TYPES = new Set([
  // Images
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",

  // Videos
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-msvideo",
  "video/x-matroska",

  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  // Excel
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

  // PowerPoint
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",

  // Text
  "text/plain",
  "text/csv",
  "application/json",
  "text/markdown",

  // Archives
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/vnd.rar",
  "application/x-7z-compressed",

  // Generic Binary
  "application/octet-stream",
]);

export const uploadSubmissionAttachments =
  multer({
    storage: multer.memoryStorage(),

    limits: {
      fileSize: MAX_FILE_SIZE,

      files: MAX_FILES,
    },

    fileFilter(
      req,
      file,
      callback
    ) {
      if (
        !ALLOWED_MIME_TYPES.has(
          file.mimetype
        )
      ) {
        return callback(
          new AppError(
            `Unsupported file type: ${file.mimetype}`,
            400,
            ErrorCode.INVALID_SUBMISSION
          )
        );
      }

      callback(null, true);
    },
  }).array(
    "attachments",
    MAX_FILES
  );