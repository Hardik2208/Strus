import multer from "multer";

import { AppError } from "../errors/AppError.js";
import { ErrorCode } from "../errors/ErrorCodes.js";

const MAX_FILE_SIZE = 2 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const uploadAvatar = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },

  fileFilter(_, file, callback) {
    if (
      !ALLOWED_MIME_TYPES.has(file.mimetype)
    ) {
      return callback(
        new AppError(
          "Only JPEG, PNG and WEBP images are allowed.",
          400,
          ErrorCode.INVALID_FILE_TYPE
        )
      );
    }

    callback(null, true);
  },
});