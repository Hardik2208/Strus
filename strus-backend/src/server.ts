import { createServer } from "http";

import app from "./app.js";

import { initializeSocket } from "./core/socket/socket.js";

import { env } from "./core/config/env.js";
import { connectRedis } from "./core/cache/redis.js";
import { logger } from "./core/logger/index.js";

import { initializeQueues } from "./core/queues/index.js";

import { EventScheduler } from "./modules/execution/jobs/execution.scheduler.js";

async function bootstrap() {
  try {

    // ==================================================
    // Connect Redis
    // ==================================================

    await connectRedis();

    // ==================================================
    // Initialize BullMQ Queues & Workers
    // ==================================================

    initializeQueues();

    // ==================================================
    // Create HTTP Server
    // ==================================================

    const httpServer =
      createServer(app);

    // ==================================================
    // Initialize Socket.IO
    // ==================================================

    initializeSocket(
      httpServer
    );

    // ==================================================
    // Start Centralized Event Scheduler
    // ==================================================

    EventScheduler.start();

    // ==================================================
    // Start HTTP Server
    // ==================================================

    httpServer.listen(
      env.PORT,
      env.HOST,
      () => {

        logger.info(
          `🚀 ${env.APP_NAME} running at http://${env.HOST}:${env.PORT}`
        );

      }
    );

    // ==================================================
    // Graceful Shutdown
    // ==================================================

    const shutdown = async () => {

      logger.info(
        "Shutting down..."
      );

      // Stop centralized scheduler
      EventScheduler.stop();

      // Close HTTP server
      httpServer.close(
        () => {
          process.exit(0);
        }
      );

    };

    process.on(
      "SIGINT",
      shutdown
    );

    process.on(
      "SIGTERM",
      shutdown
    );

  } catch (error) {

    logger.error(
      error
    );

    process.exit(1);

  }
}

bootstrap();