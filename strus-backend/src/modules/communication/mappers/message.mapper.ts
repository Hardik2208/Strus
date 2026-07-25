import type { MessageWithRelations } from "../types/message.types.js";


export class MessageMapper {
  static toMessageResponse(
    message: MessageWithRelations
){
    return {
      id: message.id,

      conversationId: message.conversationId,

      sender: {
        id: message.sender.id,

        username:
          message.sender.profile?.username,

        firstName:
          message.sender.profile?.firstName,

        lastName:
          message.sender.profile?.lastName,

        avatarUrl:
          message.sender.profile?.avatarUrl,
      },

      sequence: message.sequence,

      type: message.type,

      status: message.status,

      content: message.content,

      replyTo: message.replyTo
  ? {
      id: message.replyTo.id,

      sequence: message.replyTo.sequence,

      type: message.replyTo.type,

      content: message.replyTo.content,

      sender: {
        id: message.replyTo.sender.id,

        username:
          message.replyTo.sender.profile?.username,

        firstName:
          message.replyTo.sender.profile?.firstName,

        lastName:
          message.replyTo.sender.profile?.lastName,

        avatarUrl:
          message.replyTo.sender.profile?.avatarUrl,
      },

      createdAt: message.replyTo.createdAt,
    }
  : null,

      attachments:
        message.attachments.map(
          (attachment: any) => ({
            id: attachment.id,

            fileName: attachment.fileName,

            originalFileName:
              attachment.originalFileName,

            mimeType:
              attachment.mimeType,

            fileSize:
              attachment.fileSize,

            url:
              attachment.url,
          })
        ),

      createdAt: message.createdAt,

      updatedAt: message.updatedAt,
    };
  }
}

