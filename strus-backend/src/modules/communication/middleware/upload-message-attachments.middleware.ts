import multer from "multer";
import type { RequestHandler } from "express";

import { validateMessageAttachments } from "./message-upload.middleware.js";

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    files: 5,
    fileSize: 10 * 1024 * 1024, // 10 MB per file
  },
});

export const uploadMessageAttachments: RequestHandler = (
  req,
  res,
  next
) => {
  upload.array("attachments", 5)(
    req,
    res,
    async (err) => {
      if (err) {
        return next(err);
      }

      try {
        await validateMessageAttachments(
          (req.files as Express.Multer.File[]) ?? []
        );

        next();
      } catch (error) {
        next(error);
      }
    }
  );
};