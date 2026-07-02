import { createClient } from "redis";

import { env } from "../config/env.js";

export const redis = createClient({
  url: env.REDIS_URL,
});

redis.on("connect", () => {
  console.log("✅ Redis connected");
});

redis.on("error", (error) => {
  console.error("❌ Redis Error:", error);
});

export async function connectRedis() {
  if (!redis.isOpen) {
    await redis.connect();
  }
}