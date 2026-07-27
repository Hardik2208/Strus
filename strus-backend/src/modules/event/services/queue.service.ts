import { eventQueue } from "../../../core/queues/queues/event.queue.js";

import type { EventJobDto } from "../dtos/event-job.dto.js";

export class QueueService {
  static async enqueueEvent(job: EventJobDto): Promise<void> {
    await eventQueue.add(
      job.type,
      job,
      {
        jobId: crypto.randomUUID(),
      }
    );
  }
}