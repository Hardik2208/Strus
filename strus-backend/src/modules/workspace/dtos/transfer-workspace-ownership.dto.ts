import { z } from "zod";

export const transferWorkspaceOwnershipSchema =
  z.object({
    newOwnerId: z.uuid(),
  });

export type TransferWorkspaceOwnershipDto =
  z.infer<
    typeof transferWorkspaceOwnershipSchema
  >;