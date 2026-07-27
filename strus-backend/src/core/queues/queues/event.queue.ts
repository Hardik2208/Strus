import { Queue } from "bullmq";

import { bullConnection } from "../bull.js";
import { QUEUE_NAMES } from "../queue.constants.js";

export const eventQueue = new Queue(
  QUEUE_NAMES.EVENT,
  {
    connection: bullConnection,

    defaultJobOptions: {
      attempts: 3,

      backoff: {
        type: "exponential",

        delay: 1000,
      },

      removeOnComplete: true,

      removeOnFail: false,
    },
  }
);