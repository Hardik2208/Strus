import type { Server as HttpServer } from "http";

import { Server } from "socket.io";

import { logger } from "../logger/index.js";

import { WorkspaceRepository } from "../../modules/workspace/repositories/workspace.repository.js";
import { ConversationRepository } from "../../modules/communication/repositories/conversation.repository.js";

import { authenticateSocket } from "./socket-auth.js";
import { SocketEvents } from "./socket-events.js";

let io: Server;

export function initializeSocket(
  server: HttpServer
): Server {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.use(authenticateSocket);

  io.on(
    "connection",
    async (socket) => {
      const userId =
        socket.data.user.id;

      try {
        // ==========================================
        // Personal Room
        // ==========================================

        socket.join(
          `user:${userId}`
        );

        // ==========================================
        // Workspace Rooms
        // ==========================================

        const workspaces =
          await WorkspaceRepository.findWorkspaceIds(
            userId
          );

        for (const workspace of workspaces) {
          socket.join(
            `workspace:${workspace.workspaceId}`
          );
        }

        logger.info(
          {
            socketId: socket.id,
            userId,
            workspaces:
              workspaces.length,
          },
          "Socket connected."
        );
      } catch (error) {
        logger.error(
          {
            error,
            socketId: socket.id,
            userId,
          },
          "Failed to initialize socket."
        );

        socket.disconnect(true);

        return;
      }

      // ==========================================
      // Join Conversation
      // ==========================================

      socket.on(
        SocketEvents.CONVERSATION_JOINED,
        async (
          conversationId: string
        ) => {
          try {
            const conversation =
              await ConversationRepository.findAccessibleConversation(
                conversationId,
                userId
              );

            if (!conversation) {
              logger.warn(
                {
                  userId,
                  conversationId,
                },
                "Unauthorized conversation join."
              );

              return;
            }

            socket.join(
              `conversation:${conversationId}`
            );

            logger.info(
              {
                socketId: socket.id,
                userId,
                conversationId,
              },
              "Conversation joined."
            );
          } catch (error) {
            logger.error(
              {
                error,
                socketId: socket.id,
                userId,
                conversationId,
              },
              "Failed to join conversation."
            );
          }
        }
      );

      // ==========================================
      // Leave Conversation
      // ==========================================

      socket.on(
        SocketEvents.CONVERSATION_LEFT,
        (
          conversationId: string
        ) => {
          socket.leave(
            `conversation:${conversationId}`
          );

          logger.info(
            {
              socketId: socket.id,
              userId,
              conversationId,
            },
            "Conversation left."
          );
        }
      );

      // ==========================================
      // Disconnect
      // ==========================================

      socket.on(
        "disconnect",
        (reason) => {
          logger.info(
            {
              socketId: socket.id,
              userId,
              reason,
            },
            "Socket disconnected."
          );
        }
      );
    }
  );

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error(
      "Socket.IO not initialized."
    );
  }

  return io;
}