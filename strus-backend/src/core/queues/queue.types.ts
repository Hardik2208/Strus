import type { CreateEventDto } from "../../modules/event/dtos/create-event.dto.js";

export interface CreateEventJob {
  event: CreateEventDto;
}