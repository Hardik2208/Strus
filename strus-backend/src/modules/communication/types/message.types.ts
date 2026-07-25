import { Prisma } from "../../../generated/prisma/client.js";
import { messageInclude } from "./message.include.js";

export type MessageWithRelations =
  Prisma.MessageGetPayload<{
    include: typeof messageInclude;
  }>;