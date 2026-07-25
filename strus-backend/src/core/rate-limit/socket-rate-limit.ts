import { RateLimitService } from "./rate-limit.service.js";

export async function socketRateLimit(
  userId: string,
  config: {
    key: string;
    maxRequests: number;
    windowSeconds: number;
  }
) {
  const result =
    await RateLimitService.check(
      userId,
      config
    );

  if (!result.allowed) {
    throw new Error(
      "Rate limit exceeded."
    );
  }
}