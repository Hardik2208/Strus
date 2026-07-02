import nodemailer from "nodemailer";

import { env } from "../../../core/config/env.js";

export const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,

  port: env.SMTP_PORT,

  secure: false,

  auth: {
    user: env.SMTP_USER,

    pass: env.SMTP_PASS,
  },
});

// Verify SMTP Connection
(async () => {
  try {
    await transporter.verify();

    console.log("✅ SMTP Connected");
  } catch (error) {
    console.error("❌ SMTP Connection Failed");
    console.error(error);
  }
})();