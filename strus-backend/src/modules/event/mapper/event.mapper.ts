import type {
  Prisma,
} from "../../../generated/prisma/client.js";

import type {
  DashboardActivitiesNextCursor,
  DashboardActivityResponse,
  EventCreatedByResponse,
  EventResponse,
} from "../interfaces/event.interface.js";

type DashboardActivity =
  Prisma.EventRecipientGetPayload<{
    include: {
      event: {
        include: {
          createdBy: {
            include: {
              profile: {
                select: {
                  firstName: true;
                  lastName: true;
                  avatarUrl: true;
                };
              };
            };
          };
        };
      };
    };
  }>;

export class EventMapper {
  // ==================================================
  // Creator
  // ==================================================

  static toCreatedByResponse(
    createdBy: DashboardActivity["event"]["createdBy"]
  ): EventCreatedByResponse {
    return {
      id: createdBy.id,

      firstName:
        createdBy.profile!.firstName,

      lastName:
        createdBy.profile!.lastName,

      avatarUrl:
        createdBy.profile!.avatarUrl,
    };
  }

  // ==================================================
  // Event
  // ==================================================

  static toResponse(
    activity: DashboardActivity
  ): EventResponse {
    return {
      id: activity.event.id,

      type:
        activity.event.type,

      audience:
        activity.event.audience,

      resourceType:
        activity.event.resourceType,

      resourceId:
        activity.event.resourceId,

      title:
        activity.event.title,

      description:
        activity.event.description,

      metadata:
        activity.event.metadata,

      createdAt:
        activity.event.createdAt,

      createdBy:
        this.toCreatedByResponse(
          activity.event.createdBy
        ),
    };
  }

  // ==================================================
  // Event List
  // ==================================================

  static toResponseList(
    activities: DashboardActivity[]
  ): EventResponse[] {
    return activities.map((activity) =>
      this.toResponse(activity)
    );
  }

  // ==================================================
  // Dashboard Response
  // ==================================================

  static toDashboardResponse(
    activities: DashboardActivity[],
    hasMore: boolean,
    nextCursor: DashboardActivitiesNextCursor | null
  ): DashboardActivityResponse {
    return {
      activities:
        this.toResponseList(
          activities
        ),

      hasMore,

      nextCursor,
    };
  }
}