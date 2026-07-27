import { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../../core/database/prisma.js";

import { EventRepository } from "../repositories/event.repository.js";
import { EventMapper } from "../mapper/event.mapper.js";

import type {
  DashboardActivityResponse,
  EventResponse,
} from "../interfaces/event.interface.js";

import type {
  CreateEventDto,
} from "../dtos/create-event.dto.js";

import type {
  EventCursor,
} from "../types/event.types.js";

import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";

export class EventService {
  // ==================================================
  // Create Event
  // ==================================================

  static async create(
  tx: Prisma.TransactionClient,
  dto: CreateEventDto
): Promise<EventResponse> {

  const event =
    await EventRepository.create(tx, {
      type: dto.type,

      audience: dto.audience,

      createdBy: {
        connect: {
          id: dto.createdById,
        },
      },

      resourceType: dto.resourceType,

      resourceId: dto.resourceId,

      title: dto.title.trim(),

      description: dto.description.trim(),

      metadata:
        dto.metadata as Prisma.InputJsonValue,
    });

  await EventRepository.createRecipients(
    tx,
    dto.recipientIds.map((userId) => ({
      eventId: event.id,
      userId,
    }))
  );

  return EventMapper.toResponse({
    event,
  } as never);
}

  static async createWithoutTransaction(
    dto: CreateEventDto
  ): Promise<EventResponse> {
    return prisma.$transaction(
      async (tx) => {
        return this.create(tx, dto);
      }
    );
  }

  // ==================================================
  // Client Dashboard Activities
  // ==================================================

  static async getClientDashboardActivities(
    userId: string,
    limit: number,
    cursor?: EventCursor
  ): Promise<DashboardActivityResponse> {
    const activities =
      await EventRepository.findClientDashboardActivities(
        userId,
        limit,
        cursor
      );

    const hasMore =
      activities.length > limit;

    const results =
      hasMore
        ? activities.slice(0, limit)
        : activities;

    const last =
      results.at(-1);

    const nextCursor =
      hasMore && last
        ? {
            createdAt:
              last.event.createdAt,

            eventId:
              last.event.id,
          }
        : null;

    return EventMapper.toDashboardResponse(
      results,
      hasMore,
      nextCursor
    );
  }

  // ==================================================
  // Professional Dashboard Activities
  // ==================================================

  static async getProfessionalDashboardActivities(
    userId: string,
    limit: number,
    cursor?: EventCursor
  ): Promise<DashboardActivityResponse> {
    const activities =
      await EventRepository.findProfessionalDashboardActivities(
        userId,
        limit,
        cursor
      );

    const hasMore =
      activities.length > limit;

    const results =
      hasMore
        ? activities.slice(0, limit)
        : activities;

    const last =
      results.at(-1);

    const nextCursor =
      hasMore && last
        ? {
            createdAt:
              last.event.createdAt,

            eventId:
              last.event.id,
          }
        : null;

    return EventMapper.toDashboardResponse(
      results,
      hasMore,
      nextCursor
    );
  }
}