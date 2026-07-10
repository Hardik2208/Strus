import { z } from "zod";

export const inviteProfessionalSchema = z.object({
  userId: z
    .string()
    .uuid("Invalid professional id."),
});

export type InviteProfessionalDto =
  z.infer<
    typeof inviteProfessionalSchema
  >;