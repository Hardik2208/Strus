import path from "path";
import sanitize from "sanitize-filename";
import { fileTypeFromBuffer } from "file-type";

import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";

const MAX_TOTAL_SIZE = 40 * 1024 * 1024; // 40MB

const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",

  ".pdf",

  ".doc",
  ".docx",

  ".xls",
  ".xlsx",

  ".ppt",
  ".pptx",

  ".txt",
  ".csv",
  ".json",
  ".md",
]);

const BLOCKED_EXTENSIONS = new Set([
  ".exe",
  ".dll",
  ".bat",
  ".cmd",
  ".sh",
  ".ps1",
  ".apk",
  ".jar",
  ".msi",
  ".iso",
  ".scr",
  ".com",
]);

const RESERVED_NAMES = new Set([
  "CON",
  "PRN",
  "AUX",
  "NUL",
  "COM1",
  "COM2",
  "COM3",
  "COM4",
  "LPT1",
  "LPT2",
  "LPT3",
]);

const MAGIC_MIME = new Map([
  ["jpg", "image/jpeg"],
  ["jpeg", "image/jpeg"],
  ["png", "image/png"],
  ["webp", "image/webp"],
  ["gif", "image/gif"],

  ["pdf", "application/pdf"],

  [
    "docx",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],

  [
    "xlsx",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],

  [
    "pptx",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ],
]);

export async function validateMessageAttachments(
  files: Express.Multer.File[]
) {
  if (!files.length) return;

  // ------------------------------------------------
  // Total Payload Size
  // ------------------------------------------------

  const totalSize = files.reduce(
    (sum, file) => sum + file.size,
    0
  );

  if (totalSize > MAX_TOTAL_SIZE) {
    throw new AppError(
      "Maximum upload size is 40 MB.",
      400,
      ErrorCode.INVALID_MESSAGE_ATTACHMENT
    );
  }

  // ------------------------------------------------
  // Per File Validation
  // ------------------------------------------------

  for (const file of files) {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    // Block executables

    if (BLOCKED_EXTENSIONS.has(extension)) {
      throw new AppError(
        "Executable files are not allowed.",
        400,
        ErrorCode.INVALID_MESSAGE_ATTACHMENT
      );
    }

    // Extension whitelist

    if (!ALLOWED_EXTENSIONS.has(extension)) {
      throw new AppError(
        "Unsupported file extension.",
        400,
        ErrorCode.INVALID_MESSAGE_ATTACHMENT
      );
    }

    // Filename sanitization

    const sanitized = sanitize(file.originalname);

    if (!sanitized) {
      throw new AppError(
        "Invalid filename.",
        400,
        ErrorCode.INVALID_MESSAGE_ATTACHMENT
      );
    }

    // Path traversal

    if (
      sanitized.includes("..") ||
      sanitized.includes("/") ||
      sanitized.includes("\\") ||
      sanitized.includes("%00")
    ) {
      throw new AppError(
        "Invalid filename.",
        400,
        ErrorCode.INVALID_MESSAGE_ATTACHMENT
      );
    }

    // Windows reserved names

    const basename = path
      .parse(sanitized)
      .name
      .toUpperCase();

    if (RESERVED_NAMES.has(basename)) {
      throw new AppError(
        "Reserved filename.",
        400,
        ErrorCode.INVALID_MESSAGE_ATTACHMENT
      );
    }

    // Magic Byte Validation

    const detected =
      await fileTypeFromBuffer(file.buffer);

    if (!detected) {
      continue;
    }

    const expectedMime =
      MAGIC_MIME.get(detected.ext);

    if (!expectedMime) {
      throw new AppError(
        "Unknown file type.",
        400,
        ErrorCode.INVALID_MESSAGE_ATTACHMENT
      );
    }

    if (expectedMime !== file.mimetype) {
      throw new AppError(
        "File content does not match MIME type.",
        400,
        ErrorCode.INVALID_MESSAGE_ATTACHMENT
      );
    }

    // Replace with sanitized filename

    file.originalname = sanitized;
  }
}