import dotenv from "dotenv";
import { envSchema } from "./schema.js";

dotenv.config();

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables\n");

  console.error(parsed.error.format());

  process.exit(1);
}

export const env = parsed.data;

export const REFRESH_TOKEN_EXPIRY_DAYS = 30;