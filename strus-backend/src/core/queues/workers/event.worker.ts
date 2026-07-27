import { Worker } from "bullmq";

import { bullConnection } from "../bull.js";

import {
  JOB_NAMES,
  QUEUE_NAMES,
} from "../queue.constants.js";

import { EventProcessor } from "../../../modules/event/processor/event.processor.js";

import type { NotificationJob } from "../../../modules/event/types/notification.types.js";

export const eventWorker = new Worker<NotificationJob>(
  QUEUE_NAMES.EVENT,

  async (job) => {
    switch (job.name) {
      case JOB_NAMES.CREATE_EVENT:
        await EventProcessor.process(job.data);
        break;

      default:
        throw new Error(
          `Unknown job: ${job.name}`
        );
    }
  },

  {
    connection: bullConnection,

    concurrency: 5,
  }
);

eventWorker.on("ready", () => {
  console.log("✅ Event Worker ready");
});

eventWorker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} (${job.name}) completed successfully.`);
});

eventWorker.on("failed", (job, error) => {
  console.error(
    `❌ Job ${job?.id} failed`,
    error
  );
});

eventWorker.on("error", (error: Error) => {
  console.error(
    "❌ Worker Error",
    error
  );
});