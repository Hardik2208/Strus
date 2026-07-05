import type { Workspace } from "../../../generated/prisma/client.js";

import type { WorkspaceResponse } from "../interfaces/workspace-response.interface.js";
import type { MemberResponse } from "../interfaces/member-response.interface.js";
import { WorkspaceRole } from "../../../generated/prisma/enums.js";

export class WorkspaceMapper {
  static toResponse(
    workspace: Workspace,
    myRole: "OWNER" | "ADMIN" | "MEMBER"
  ): WorkspaceResponse {
    return {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      description: workspace.description,
      workspaceType: workspace.workspaceType,
      myRole,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
    };
  }

  static toMemberResponse(member: {
  role: "OWNER" | "ADMIN" | "MEMBER";

  joinedAt: Date;

  user: {
    id: string;

    profile: {
      username: string;
      firstName: string;
      lastName: string;
      avatarUrl: string | null;
    } | null;
  };
}): MemberResponse {
  if (!member.user.profile) {
    throw new Error(
      "Workspace member profile not found."
    );
  }

  return {
    id: member.user.id,

    username: member.user.profile.username,

    firstName: member.user.profile.firstName,

    lastName: member.user.profile.lastName,

    avatarUrl:
      member.user.profile.avatarUrl,

    role: member.role,

    joinedAt: member.joinedAt,
  };
}

static toMemberResponseList(
  members: {
    role: WorkspaceRole;

    joinedAt: Date;

    user: {
      id: string;

      profile: {
        username: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
      } | null;
    };
  }[]
): MemberResponse[] {
  return members.map((member) =>
    this.toMemberResponse(member)
  );
}
}

