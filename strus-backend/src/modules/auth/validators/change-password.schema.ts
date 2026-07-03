import { z } from "zod";

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Current password is required."),

    newPassword: z
      .string()
      .min(
        8,
        "Password must be at least 8 characters."
      )
      .max(
        128,
        "Password cannot exceed 128 characters."
      )
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/,
        "Password must contain uppercase, lowercase, number and special character."
      ),
  })
  .refine(
    (data) =>
      data.currentPassword !== data.newPassword,
    {
      path: ["newPassword"],
      message:
        "New password must be different from current password.",
    }
  );

export type ChangePasswordInput =
  z.infer<typeof changePasswordSchema>;