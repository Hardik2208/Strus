import { z } from "zod";

import {
  EventAudience,
  EventResourceType,
  EventType,
} from "../../../generated/prisma/enums.js";

export const CreateEventSchema = z.object({
  //
  // Event Details
  //

  type: z.nativeEnum(EventType),

  audience: z.nativeEnum(EventAudience),

  //
  // Creator
  //

  createdById: z.uuid(),

  //
  // Resource
  //

  resourceType: z.nativeEnum(EventResourceType),

  resourceId: z.uuid(),

  //
  // Content
  //

  title: z
    .string()
    .trim()
    .min(1)
    .max(200),

  description: z
    .string()
    .trim()
    .min(1)
    .max(500),

  //
  // Metadata
  //

  metadata: z.record(
    z.string(),
    z.unknown()
  ),

  //
  // Recipients
  //

  recipientIds: z
    .array(z.uuid())
    .min(1)
    .max(1000),
});

export type CreateEventDto =
  z.infer<typeof CreateEventSchema>;