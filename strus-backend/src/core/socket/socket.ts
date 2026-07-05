import type { Server as HttpServer } from "http";

import { Server } from "socket.io";

import { logger } from "../logger/index.js";

import { WorkspaceRepository } from "../../modules/workspace/repositories/workspace.repository.js";

import { authenticateSocket } from "./socket-auth.js";

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
        socket.join(
          `user:${userId}`
        );

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