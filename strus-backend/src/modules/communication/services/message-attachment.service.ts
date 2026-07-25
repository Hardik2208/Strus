import { randomUUID } from "crypto";
import path from "path";
import { MessageAttachmentType } from "../../../generated/prisma/enums.js";
import { CloudinaryService } from "../../../core/storage/cloudinary.service.js";

export interface UploadedAttachment {
  originalName: string;
  storedName: string;
  mimeType: string;
  extension: string;
  size: number;

  publicId: string;
  url: string;

  resourceType: "image" | "video" | "raw";

  attachmentType: MessageAttachmentType;
}


export interface PersistedAttachment {
  publicId: string;
  mimeType: string;
}

export class MessageAttachmentService {

  private static mimeTypeToResourceType(
  mimeType: string
): "image" | "video" | "raw" {
  if (mimeType.startsWith("image/")) {
    return "image";
  }

  if (mimeType.startsWith("video/")) {
    return "video";
  }

  return "raw";
}

  private static getAttachmentType(
  file: Express.Multer.File
): MessageAttachmentType {
  const mime = file.mimetype.toLowerCase();

  if (mime.startsWith("image/")) {
    return MessageAttachmentType.IMAGE;
  }

  if (mime.startsWith("video/")) {
    return MessageAttachmentType.VIDEO;
  }

  if (mime.startsWith("audio/")) {
    return MessageAttachmentType.AUDIO;
  }

  if (
    mime === "application/zip" ||
    mime === "application/x-zip-compressed" ||
    mime === "application/x-rar-compressed" ||
    mime === "application/x-7z-compressed" ||
    mime === "application/gzip"
  ) {
    return MessageAttachmentType.ARCHIVE;
  }

  if (
    mime === "application/pdf" ||
    mime.includes("word") ||
    mime.includes("spreadsheet") ||
    mime.includes("presentation") ||
    mime.startsWith("text/")
  ) {
    return MessageAttachmentType.DOCUMENT;
  }

  return MessageAttachmentType.OTHER;
}
  // ==================================================
  // Upload Attachments
  // ==================================================

  static async uploadAttachments(
    files: Express.Multer.File[]
  ): Promise<UploadedAttachment[]> {
    const uploaded: UploadedAttachment[] = [];

    try {
      for (const file of files) {
        const extension = path.extname(
          file.originalname
        );

        const storedName =
          `${randomUUID()}${extension}`;

        const upload =
          await CloudinaryService.upload(
            file.buffer,
            {
              folder:
                "strus/workspace-chat",

              publicId:
                storedName.replace(
                  extension,
                  ""
                ),

              resourceType:
                this.getResourceType(file),
            }
          );

        uploaded.push({
  originalName: file.originalname,
  storedName,
  mimeType: file.mimetype,
  extension,
  size: upload.bytes,
  publicId: upload.publicId,
  url: upload.url,
  resourceType: this.toResourceType(upload.resourceType),
  attachmentType: this.getAttachmentType(file),
});
      }

      return uploaded;
    } catch (error) {
      await Promise.all(
        uploaded.map((file) =>
          CloudinaryService.delete(
            file.publicId,
            file.resourceType
          )
        )
      );

      throw error;
    }
  }

  // ==================================================
  // Resource Type
  // ==================================================

  private static getResourceType(
    file: Express.Multer.File
  ): "image" | "raw" {
    return file.mimetype.startsWith("image/")
      ? "image"
      : "raw";
  }

  // ==================================================
// Resource Type Validation
// ==================================================

private static toResourceType(
  resourceType: string
): "image" | "video" | "raw" {
  switch (resourceType) {
    case "image":
    case "video":
    case "raw":
      return resourceType;

    default:
      throw new Error(
        `Unsupported Cloudinary resource type: ${resourceType}`
      );
  }
}

// ==================================================
// Delete Attachments
// ==================================================

static async deleteAttachments(
  attachments: UploadedAttachment[]
): Promise<void> {
  if (attachments.length === 0) {
    return;
  }

  await Promise.all(
    attachments.map((attachment) =>
      CloudinaryService.delete(
        attachment.publicId,
        attachment.resourceType
      )
    )
  );
}

static async deletePersistedAttachments(
  attachments: PersistedAttachment[]
): Promise<void> {
  if (attachments.length === 0) {
    return;
  }

  await Promise.all(
    attachments.map((attachment) =>
      CloudinaryService.delete(
        attachment.publicId,
        this.mimeTypeToResourceType(attachment.mimeType)
      )
    )
  );
}
}