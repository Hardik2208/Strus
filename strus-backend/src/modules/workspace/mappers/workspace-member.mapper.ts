import type { Prisma } from "../../../generated/prisma/client.js";

import type { MemberResponse } from "../interfaces/member-response.interface.js";

type WorkspaceMemberWithProfile =
  Prisma.WorkspaceMemberGetPayload<{
    include: {
      user: {
        include: {
          profile: {
            select: {
              username: true;
              firstName: true;
              lastName: true;
              avatarUrl: true;
            };
          };
        };
      };
    };
  }>;

export class WorkspaceMemberMapper {
  static toResponse(
    member: WorkspaceMemberWithProfile
  ): MemberResponse {
    return {
      id: member.user.id,
      username: member.user.profile!.username,
      firstName: member.user.profile!.firstName,
      lastName: member.user.profile!.lastName,
      avatarUrl: member.user.profile!.avatarUrl,
      role: member.role,
      joinedAt: member.joinedAt,
    };
  }

  static toResponseList(
    members: WorkspaceMemberWithProfile[]
  ): MemberResponse[] {
    return members.map((member) =>
      this.toResponse(member)
    );
  }
}