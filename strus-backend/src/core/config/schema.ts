import { z } from "zod";

export const envSchema = z.object({
  // --------------------------------------------------
  // Application
  // --------------------------------------------------
  NODE_ENV: z.enum(["development", "test", "production"]),

  HOST: z.string().default("0.0.0.0"),

  PORT: z.coerce.number().int().positive(),

  APP_NAME: z.string().min(1),

  APP_URL: z.string().url(),

  API_PREFIX: z.string().default("/api/v1"),

  // --------------------------------------------------
  // Database
  // --------------------------------------------------
  DATABASE_URL: z.string().min(1),

  // --------------------------------------------------
  // Redis
  // --------------------------------------------------
  REDIS_URL: z.string().min(1),

  // --------------------------------------------------
  // JWT
  // --------------------------------------------------
  JWT_ACCESS_SECRET: z.string().min(32),

  JWT_REFRESH_SECRET: z.string().min(32),

  JWT_ACCESS_EXPIRES_IN: z.string(),

  JWT_REFRESH_EXPIRES_IN: z.string(),

  JWT_RESET_SECRET: z.string().min(32),

  // --------------------------------------------------
  // Google OAuth
  // --------------------------------------------------
  GOOGLE_CLIENT_ID: z.string().min(1),

  GOOGLE_CLIENT_SECRET: z.string().min(1),

  GOOGLE_CALLBACK_URL: z.string().url(),

  // --------------------------------------------------
  // Mail
  // --------------------------------------------------
  SMTP_HOST: z.string(),

  SMTP_PORT: z.coerce.number(),

  SMTP_USER: z.string(),

  SMTP_PASS: z.string(),

  SMTP_FROM: z.string(),

  EMAIL_VERIFICATION_OTP_EXPIRY_MINUTES: z.coerce.number().default(10),

  // --------------------------------------------------
  // Cloudinary
  // --------------------------------------------------
  CLOUDINARY_CLOUD_NAME: z.string().optional(),

  CLOUDINARY_API_KEY: z.string().optional(),

  CLOUDINARY_API_SECRET: z.string().optional(),

  // --------------------------------------------------
  // Security
  // --------------------------------------------------
  BCRYPT_ROUNDS: z.coerce.number().min(10).max(16),

  COOKIE_SECRET: z.string().min(32),

  FRONTEND_URL: z.string().url(),
});

export type Env = z.infer<typeof envSchema>;