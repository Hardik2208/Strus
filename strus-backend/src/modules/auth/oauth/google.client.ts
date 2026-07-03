import { OAuth2Client } from "google-auth-library";

import { env } from "../../../core/config/env.js";

export const googleClient =
  new OAuth2Client(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_CALLBACK_URL
  );