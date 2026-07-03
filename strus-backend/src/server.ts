import app from "./app.js";

import { env } from "./core/config/env.js";
import { connectRedis } from "./core/cache/redis.js";
import { logger } from "./core/logger/index.js";
import passport from "passport";

async function bootstrap() {
  try {

    await connectRedis();
    const server = app.listen(
      env.PORT,
      env.HOST,
      () => {
        logger.info(
          `🚀 ${env.APP_NAME} running at http://${env.HOST}:${env.PORT}`
        );
      }
    );

    const shutdown = async () => {
      logger.info("Shutting down...");

      server.close(() => {
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    logger.error(error);

    process.exit(1);
  }
}

bootstrap();