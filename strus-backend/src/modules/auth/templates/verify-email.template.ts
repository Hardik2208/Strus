export function verifyEmailTemplate(
  firstName: string,
  verificationUrl: string
): string {
  return `
    <h2>Welcome to Strus</h2>

    <p>Hello ${firstName},</p>

    <p>Please verify your email.</p>

    <a href="${verificationUrl}">
      Verify Email
    </a>

    <p>This link expires in 24 hours.</p>
  `;
}