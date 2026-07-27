import { JOB_NAMES } from "./queue.constants.js";
import { eventQueue } from "./queues/event.queue.js";
import type { CreateEventDto } from "../../modules/event/dtos/create-event.dto.js";

export class QueueService {
  static async enqueueEvent(
    event: CreateEventDto
  ): Promise<void> {
    await eventQueue.add(
      JOB_NAMES.CREATE_EVENT,
      {
        event,
      }
    );
  }
}