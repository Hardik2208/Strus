import { Readable } from "node:stream";

import { cloudinary } from "./cloudinary.js";

export interface UploadFileOptions {
  folder: string;

  publicId?: string;

  resourceType?:
    | "image"
    | "video"
    | "raw";
}

export interface UploadFileResponse {
  url: string;

  publicId: string;

  bytes: number;

  format: string;
}

export class CloudinaryService {
  static async upload(
    buffer: Buffer,
    options: UploadFileOptions
  ): Promise<UploadFileResponse> {
    return new Promise(
      (resolve, reject) => {
        const stream =
          cloudinary.uploader.upload_stream(
            {
              folder: options.folder,

              public_id: options.publicId,

              overwrite: true,

              resource_type:
                options.resourceType ??
                "image",
            },

            (error, result) => {
              if (error || !result) {
                return reject(error);
              }

              resolve({
                url: result.secure_url,

                publicId:
                  result.public_id,

                bytes: result.bytes,

                format: result.format,
              });
            }
          );

        Readable.from(buffer).pipe(stream);
      }
    );
  }

  static async delete(
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image"
): Promise<void> {
  await cloudinary.uploader.destroy(
    publicId,
    {
      resource_type: resourceType,
    }
  );
}
}