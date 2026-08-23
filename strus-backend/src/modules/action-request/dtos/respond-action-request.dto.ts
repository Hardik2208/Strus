import { z } from "zod";

export const respondActionRequestSchema =
  z.object({

    decision:
      z.enum([
        "CONTINUE",
        "TERMINATE",
      ]),

  });

export type RespondActionRequestDto =
  z.infer<
    typeof respondActionRequestSchema
  >;