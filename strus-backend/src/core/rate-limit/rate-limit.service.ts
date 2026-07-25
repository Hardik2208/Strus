import { redis } from "../cache/redis.js";

const RATE_LIMIT_SCRIPT = `
local current = redis.call("INCR", KEYS[1])

if current == 1 then
    redis.call("EXPIRE", KEYS[1], tonumber(ARGV[1]))
end

local ttl = redis.call("TTL", KEYS[1])

return { current, ttl }
`;

export class RateLimitService {
  static async check(
    userId: string,
    config: {
      key: string;
      maxRequests: number;
      windowSeconds: number;
    }
  ) {
    const redisKey = `rl:${config.key}:${userId}`;

    const result = await redis.eval(RATE_LIMIT_SCRIPT, {
      keys: [redisKey],
      arguments: [config.windowSeconds.toString()],
    });

    if (
      !Array.isArray(result) ||
      result.length !== 2
    ) {
      throw new Error(
        "Invalid response from Redis rate limiter."
      );
    }

    const requests = Number(result[0]);
    const ttl = Math.max(Number(result[1]), 0);

    return {
      allowed: requests <= config.maxRequests,

      remaining: Math.max(
        config.maxRequests - requests,
        0
      ),

      retryAfter: ttl,

      requests,
    };
  }
}