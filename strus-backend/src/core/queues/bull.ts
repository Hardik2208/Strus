import { Redis } from "ioredis";

import { env } from "../config/env.js";

export const bullConnection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

bullConnection.on("connect", () => {
  console.log("✅ BullMQ Redis connected");
});

bullConnection.on("error", (error) => {
  console.error(
    "❌ BullMQ Redis Error:",
    error
  );
});