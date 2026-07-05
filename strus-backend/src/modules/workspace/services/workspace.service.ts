import type {
  Prisma,
  Workspace,
} from "../../../generated/prisma/client.js";
import type { UpdateMemberRoleDto } from "../dtos/update-member-role.dto.js";
import { WorkspaceRepository } from "../repositories/workspace.repository.js";
import { WorkspaceSlugUtil } from "../utils/workspace-slug.util.js";
import { WorkspaceMapper } from "../mappers/workspace.mapper.js";
import type { CreatePersonalWorkspaceInput } from "../types/create-workspace.types.js";
import { WorkspaceMemberMapper } from "../mappers/workspace-member.mapper.js";
import type { MemberResponse } from "../interfaces/member-response.interface.js";
import crypto from "node:crypto";
import type { CreateWorkspaceDto } from "../dtos/create-workspace.dto.js";
import type { UpdateWorkspaceDto } from "../dtos/update-workspace.dto.js";
import { WorkspaceValidator } from "../validators/workspace.validator.js";
import { AppError } from "../../../core/errors/AppError.js";
import { ErrorCode } from "../../../core/errors/ErrorCodes.js";
import type { WorkspaceResponse } from "../interfaces/workspace-response.interface.js";
import { profileRepository } from "../../users/repositories/profile.repository.js";
import type { MemberListResponse } from "../interfaces/member-list-response.interface.js";
import type { MemberSearchQueryDto } from "../dtos/member-search-query.dto.js";
import { WorkspaceInvitationStatus,WorkspaceRole,WorkspaceType } from "../../../generated/prisma/enums.js";
import type {InvitationQueryDto} from  "../dtos/invitation-query.dto.js"
import { WorkspaceInvitationMapper } from "../mappers/workspace-invitation.mapper.js";
import { WorkspaceInvitationValidator } from "../validators/workspace-invitation.validator.js";
import type { CreateWorkspaceInvitationDto } from "../dtos/create-workspace-invitation.dto.js";
import type { WorkspaceInvitationResponse } from "../interfaces/workspace-invitation-response.interface.js";
import type {InvitationListResponse} from "../interfaces/invitation-list-response.interface.js"
import type { AuditQueryDto } from "../dtos/audit-query.dto.js";
import type { WorkspaceAuditListResponse } from "../interfaces/workspace-audit-list-response.interface.js";
import { WorkspaceAuditMapper } from "../mappers/workspace-audit.mapper.js";
import { WorkspaceAuditRepository } from "../repositories/workspace-audit.repository.js";
import { AuditAction } from "../../../generated/prisma/enums.js";

export class WorkspaceService {

  private static readonly INVITATION_EXPIRY_DAYS = 7;

  static async createPersonalWorkspace(
    tx: Prisma.TransactionClient,
    input: CreatePersonalWorkspaceInput
  ): Promise<void> {
    const workspaceName =
      input.firstName && input.lastName
        ? `${input.firstName} ${input.lastName}'s Workspace`
        : "Personal Workspace";

    const slug = WorkspaceSlugUtil.generate(input.username);

    const workspace = await WorkspaceRepository.createWorkspace(tx, {
      ownerId: input.userId,
      name: workspaceName,
      slug,
      description: null,
      workspaceType: WorkspaceType.PERSONAL,
    });

    await WorkspaceRepository.createWorkspaceMember(tx, {
      workspaceId: workspace.id,
      userId: input.userId,
      role: WorkspaceRole.OWNER,
    });
  }

  static async createTeamWorkspace(
  tx: Prisma.TransactionClient,
  ownerId: string,
  data: CreateWorkspaceDto
): Promise<Workspace> {
  WorkspaceValidator.validateName(data.name);

  WorkspaceValidator.validateDescription(
    data.description
  );

  let slug = WorkspaceSlugUtil.generate(data.name);

  const exists =
    await WorkspaceRepository.slugExists(slug);

  if (exists) {
    slug = `${slug}-${crypto.randomUUID().slice(0, 8)}`;
  }

  const workspace =
    await WorkspaceRepository.createWorkspace(tx, {
      ownerId,
      name: data.name.trim(),
      slug,
      description: data.description?.trim() ?? null,
      workspaceType: WorkspaceType.TEAM,
    });
  
  await WorkspaceAuditRepository.create(tx, {
  workspaceId: workspace.id,
  actorId: ownerId,
  action: AuditAction.WORKSPACE_CREATED,
});

  await WorkspaceRepository.createWorkspaceMember(tx, {
    workspaceId: workspace.id,
    userId: ownerId,
    role: WorkspaceRole.OWNER,
  });

  return workspace;
}

static async getUserWorkspaces(
  userId: string
): Promise<WorkspaceResponse[]> {
  const memberships =
    await WorkspaceRepository.findUserWorkspaces(
      userId
    );

  return memberships.map((membership) =>
    WorkspaceMapper.toResponse(
      membership.workspace,
      membership.role
    )
  );
}

static async getWorkspace(
  workspaceId: string,
  userId: string
): Promise<WorkspaceResponse>  {
  const membership =
    await WorkspaceRepository.findById(
      workspaceId,
      userId
    );

  if (!membership) {
    throw new AppError(
      "Workspace not found.",
      404,
      ErrorCode.WORKSPACE_NOT_FOUND
    );
  }

  return WorkspaceMapper.toResponse(
    membership.workspace,
    membership.role
  );
}

static async updateWorkspace(
  tx: Prisma.TransactionClient,
  workspaceId: string,
  userId: string,
  data: UpdateWorkspaceDto
): Promise<Workspace>  {
  const membership =
    await WorkspaceRepository.findById(
      workspaceId,
      userId
    );

  if (!membership) {
    throw new AppError(
      "Workspace not found.",
      404,
      ErrorCode.WORKSPACE_NOT_FOUND
    );
  }

  if (
    membership.workspace.workspaceType ===
    WorkspaceType.PERSONAL
  ) {
    throw new AppError(
      "Personal workspaces cannot be updated.",
      403,
      ErrorCode.PERSONAL_WORKSPACE_OPERATION_NOT_ALLOWED
    );
  }

  if (
    membership.role !== WorkspaceRole.OWNER
  ) {
    throw new AppError(
      "Only the workspace owner can update the workspace.",
      403,
      ErrorCode.INSUFFICIENT_PERMISSIONS
    );
  }

  const updateData: Prisma.WorkspaceUpdateInput =
    {};

  if (
    data.name &&
    data.name.trim() !==
      membership.workspace.name
  ) {
    WorkspaceValidator.validateName(
      data.name
    );

    let slug =
      WorkspaceSlugUtil.generate(
        data.name
      );

    const exists =
      await WorkspaceRepository.slugExists(
        slug
      );

    if (exists) {
      slug = `${slug}-${crypto
        .randomUUID()
        .slice(0, 8)}`;
    }

    updateData.name = data.name.trim();
    updateData.slug = slug;
  }

  if (
    data.description !== undefined
  ) {
    WorkspaceValidator.validateDescription(
      data.description
    );

    updateData.description =
      data.description?.trim() ?? null;
  }

  await WorkspaceAuditRepository.create(tx, {
  workspaceId,
  actorId: userId,
  action: AuditAction.WORKSPACE_UPDATED,
});

  return WorkspaceRepository.updateWorkspace(
    tx,
    workspaceId,
    updateData
  );
}

static async deleteWorkspace(
  tx: Prisma.TransactionClient,
  workspaceId: string,
  userId: string
): Promise<void> {
  const membership =
    await WorkspaceRepository.findById(
      workspaceId,
      userId
    );

  if (!membership) {
    throw new AppError(
      "Workspace not found.",
      404,
      ErrorCode.WORKSPACE_NOT_FOUND
    );
  }

  if (
    membership.workspace.workspaceType ===
    WorkspaceType.PERSONAL
  ) {
    throw new AppError(
      "Personal workspaces cannot be deleted.",
      403,
      ErrorCode.PERSONAL_WORKSPACE_OPERATION_NOT_ALLOWED
    );
  }

  if (
    membership.role !== WorkspaceRole.OWNER
  ) {
    throw new AppError(
      "Only the workspace owner can delete the workspace.",
      403,
      ErrorCode.INSUFFICIENT_PERMISSIONS
    );
  }

  // Future:
  // Check active projects before deletion.
  await WorkspaceAuditRepository.create(tx, {
  workspaceId,
  actorId: userId,
  action: AuditAction.WORKSPACE_DELETED,
});

  await WorkspaceRepository.deleteWorkspace(
    tx,
    workspaceId
  );
}

static async getWorkspaceMembers(
  workspaceId: string,
  userId: string,
  query: MemberSearchQueryDto
): Promise<MemberListResponse> {
  // ------------------------------------------
  // Verify Membership
  // ------------------------------------------

  const membership =
    await WorkspaceRepository.findById(
      workspaceId,
      userId
    );

  if (!membership) {
    throw new AppError(
      "Workspace not found.",
      404,
      ErrorCode.WORKSPACE_NOT_FOUND
    );
  }

  const page = query.page ?? 1;

  const limit = query.limit ?? 20;

  const {
    members,
    total,
  } =
    await WorkspaceRepository.searchWorkspaceMembers(
      workspaceId,
      query.search,
      page,
      limit
    );

  return {
    members:
  WorkspaceMapper.toMemberResponseList(
    members
  ),

    pagination: {
      page,

      limit,

      total,

      totalPages: Math.ceil(
        total / limit
      ),

      hasNext:
        page * limit < total,
    },
  };
}

static async updateMemberRole(
  tx: Prisma.TransactionClient,
  workspaceId: string,
  ownerId: string,
  memberId: string,
  data: UpdateMemberRoleDto
): Promise<void> {
  // ------------------------------------------
  // Verify requester
  // ------------------------------------------

  const requester =
    await WorkspaceRepository.findById(
      workspaceId,
      ownerId
    );

  if (!requester) {
    throw new AppError(
      "Workspace not found.",
      404,
      ErrorCode.WORKSPACE_NOT_FOUND
    );
  }

  // ------------------------------------------
  // Personal workspace
  // ------------------------------------------

  if (
    requester.workspace.workspaceType ===
    WorkspaceType.PERSONAL
  ) {
    throw new AppError(
      "Personal workspace members cannot be modified.",
      403,
      ErrorCode.PERSONAL_WORKSPACE_OPERATION_NOT_ALLOWED
    );
  }

  // ------------------------------------------
  // Owner check
  // ------------------------------------------

  if (
    requester.role !== WorkspaceRole.OWNER
  ) {
    throw new AppError(
      "Only the workspace owner can update member roles.",
      403,
      ErrorCode.INSUFFICIENT_PERMISSIONS
    );
  }

  // ------------------------------------------
  // Cannot modify yourself
  // ------------------------------------------

  if (ownerId === memberId) {
    throw new AppError(
      "You cannot modify your own role.",
      400,
      ErrorCode.INVALID_INVITATION
    );
  }

  // ------------------------------------------
  // Target member
  // ------------------------------------------

  const member =
    await WorkspaceRepository.findMember(
      workspaceId,
      memberId
    );

  if (!member) {
    throw new AppError(
      "Member not found.",
      404,
      ErrorCode.MEMBER_NOT_FOUND
    );
  }

  // ------------------------------------------
  // Cannot modify owner
  // ------------------------------------------

  if (
    member.role === WorkspaceRole.OWNER
  ) {
    throw new AppError(
      "Owner role cannot be modified.",
      400,
      ErrorCode.INVALID_OPERATION
    );
  }

  // ------------------------------------------
  // No change
  // ------------------------------------------

  if (member.role === data.role) {
    throw new AppError(
      "Member already has this role.",
      400,
      ErrorCode.INVALID_OPERATION
    );
  }

  // ------------------------------------------
  // Update
  // ------------------------------------------

  await WorkspaceAuditRepository.create(tx, {
  workspaceId,
  actorId: ownerId,

  action:
    data.role === WorkspaceRole.ADMIN
      ? AuditAction.MEMBER_PROMOTED
      : AuditAction.MEMBER_DEMOTED,

  entityId: memberId,
});

  await WorkspaceRepository.updateMemberRole(
    tx,
    workspaceId,
    memberId,
    data.role
  );
}

static async createInvitation(
  tx: Prisma.TransactionClient,
  workspaceId: string,
  ownerId: string,
  dto: CreateWorkspaceInvitationDto
): Promise<WorkspaceInvitationResponse> {
  // ------------------------------------------
  // Workspace Access
  // ------------------------------------------

  const requester =
    await WorkspaceRepository.findById(
      workspaceId,
      ownerId
    );

  if (!requester) {
    throw new AppError(
      "Workspace not found.",
      404,
      ErrorCode.WORKSPACE_NOT_FOUND
    );
  }

  // ------------------------------------------
  // Personal Workspace
  // ------------------------------------------

  if (
    requester.workspace.workspaceType ===
    WorkspaceType.PERSONAL
  ) {
    throw new AppError(
      "Cannot invite members to a personal workspace.",
      403,
      ErrorCode.PERSONAL_WORKSPACE_OPERATION_NOT_ALLOWED
    );
  }

  // ------------------------------------------
  // Owner & Admin Only
  // ------------------------------------------

  if (
  requester.role !== WorkspaceRole.OWNER &&
  requester.role !== WorkspaceRole.ADMIN
) {
  throw new AppError(
    "You do not have permission to invite members.",
    403,
    ErrorCode.INSUFFICIENT_PERMISSIONS
  );
}

  // ------------------------------------------
  // Normalize Email
  // ------------------------------------------

  const identifier =
  WorkspaceInvitationValidator.validateIdentifier(
    dto.identifier
  );

const user =
  await WorkspaceRepository.findUserByIdentifier(
    identifier
  );

if (!user) {
  throw new AppError(
    "User not found.",
    404,
    ErrorCode.USER_NOT_FOUND
  );
}

  // ------------------------------------------
// Already a Member
// ------------------------------------------

const existingMember =
  await WorkspaceRepository.findMember(
    workspaceId,
    user.id
  );

if (existingMember) {
  throw new AppError(
    "User is already a workspace member.",
    409,
    ErrorCode.MEMBER_ALREADY_EXISTS
  );
}

  // ------------------------------------------
  // Existing Invitation
  // ------------------------------------------

  const existingInvitation =
    await WorkspaceRepository.findPendingInvitation(
  workspaceId,
  user.id
);

  if (existingInvitation) {
    throw new AppError(
      "Invitation already exists.",
      409,
      ErrorCode.INVITATION_ALREADY_EXISTS
    );
  }

  // ------------------------------------------
  // Expiry
  // ------------------------------------------

  const expiresAt = new Date();

  expiresAt.setDate(
    expiresAt.getDate() +
      this.INVITATION_EXPIRY_DAYS
  );

  // ------------------------------------------
  // Create
  // ------------------------------------------

  const invitation =
    await WorkspaceRepository.createInvitation(
  tx,
  {
    workspaceId,
    invitedByUserId: ownerId,
    invitedUserId: user.id,
    expiresAt,
  }
);

await WorkspaceAuditRepository.create(tx, {
  workspaceId,
  actorId: ownerId,
  action: AuditAction.INVITATION_CREATED,

  entityId: invitation.id,

  metadata: {
    invitedUserId: user.id,
  },
});

  return WorkspaceInvitationMapper.toResponse(
    invitation
  );
}

static async getWorkspaceInvitations(
  workspaceId: string,
  userId: string,
  query: InvitationQueryDto
): Promise<InvitationListResponse> {
  const membership =
    await WorkspaceRepository.findById(
      workspaceId,
      userId
    );

  if (!membership) {
    throw new AppError(
      "Workspace not found.",
      404,
      ErrorCode.WORKSPACE_NOT_FOUND
    );
  }

  const page = query.page ?? 1;

  const limit = query.limit ?? 20;

  const {
    invitations,
    total,
  } =
    await WorkspaceRepository.findWorkspaceInvitations(
      workspaceId,
      page,
      limit
    );

  return {
    invitations:
      WorkspaceInvitationMapper.toResponseList(
        invitations
      ),

    pagination: {
      page,

      limit,

      total,

      totalPages: Math.ceil(
        total / limit
      ),

      hasNext:
        page * limit < total,
    },
  };
}

static async acceptInvitation(
  tx: Prisma.TransactionClient,
  invitationId: string,
  userId: string
): Promise<{
  workspaceId: string;
}> {
  const invitation =
    await WorkspaceRepository.findInvitationById(
      invitationId
    );

  if (!invitation) {
    throw new AppError(
      "Invitation not found.",
      404,
      ErrorCode.INVITATION_NOT_FOUND
    );
  }

  if (
    invitation.status !==
    WorkspaceInvitationStatus.PENDING
  ) {
    throw new AppError(
      "Invitation is no longer valid.",
      400,
      ErrorCode.INVALID_OPERATION
    );
  }

  if (
    invitation.expiresAt < new Date()
  ) {
    await WorkspaceRepository.updateInvitationStatus(
      tx,
      invitation.id,
      WorkspaceInvitationStatus.EXPIRED
    );

    throw new AppError(
      "Invitation has expired.",
      400,
      ErrorCode.INVITATION_EXPIRED
    );
  }

  const existingMember =
    await WorkspaceRepository.findAcceptedMember(
      invitation.workspaceId,
      userId
    );

  if (existingMember) {
    throw new AppError(
      "Already a workspace member.",
      409,
      ErrorCode.MEMBER_ALREADY_EXISTS
    );
  }

  await WorkspaceRepository.createWorkspaceMember(
    tx,
    {
      workspaceId:
        invitation.workspaceId,
      userId,
      role: WorkspaceRole.MEMBER,
    }
  );

  await WorkspaceRepository.updateInvitationStatus(
    tx,
    invitation.id,
    WorkspaceInvitationStatus.ACCEPTED
  );

  await WorkspaceAuditRepository.create(tx, {
    workspaceId: invitation.workspaceId,
    actorId: userId,
    action: AuditAction.INVITATION_ACCEPTED,
    entityId: invitation.id,
  });

  await WorkspaceAuditRepository.create(tx, {
    workspaceId: invitation.workspaceId,
    actorId: userId,
    action: AuditAction.MEMBER_JOINED,
    entityId: userId,
  });

  return {
    workspaceId:
      invitation.workspaceId,
  };
}

static async declineInvitation(
  tx: Prisma.TransactionClient,
  invitationId: string,
  userId: string
): Promise<{
  workspaceId: string;
}> {
  const invitation =
    await WorkspaceRepository.findInvitationById(
      invitationId
    );

  if (!invitation) {
    throw new AppError(
      "Invitation not found.",
      404,
      ErrorCode.INVITATION_NOT_FOUND
    );
  }

  if (
    invitation.status !==
    WorkspaceInvitationStatus.PENDING
  ) {
    throw new AppError(
      "Invitation is no longer valid.",
      400,
      ErrorCode.INVALID_OPERATION
    );
  }

  if (
    invitation.expiresAt < new Date()
  ) {
    await WorkspaceRepository.updateInvitationStatus(
      tx,
      invitation.id,
      WorkspaceInvitationStatus.EXPIRED
    );

    throw new AppError(
      "Invitation has expired.",
      400,
      ErrorCode.INVITATION_EXPIRED
    );
  }

  await WorkspaceRepository.updateInvitationStatus(
    tx,
    invitation.id,
    WorkspaceInvitationStatus.DECLINED
  );

  await WorkspaceAuditRepository.create(tx, {
    workspaceId: invitation.workspaceId,
    actorId: userId,
    action: AuditAction.INVITATION_DECLINED,
    entityId: invitation.id,
  });

  return {
    workspaceId:
      invitation.workspaceId,
  };
}

static async cancelInvitation(
  tx: Prisma.TransactionClient,
  workspaceId: string,
  ownerId: string,
  invitationId: string
): Promise<{
  invitedUserId: string;
}> {
  const requester =
    await WorkspaceRepository.findById(
      workspaceId,
      ownerId
    );

  if (!requester) {
    throw new AppError(
      "Workspace not found.",
      404,
      ErrorCode.WORKSPACE_NOT_FOUND
    );
  }

  if (
    requester.workspace.workspaceType ===
    WorkspaceType.PERSONAL
  ) {
    throw new AppError(
      "Personal workspaces do not support invitations.",
      403,
      ErrorCode.PERSONAL_WORKSPACE_OPERATION_NOT_ALLOWED
    );
  }

  if (
    requester.role !== WorkspaceRole.OWNER
  ) {
    throw new AppError(
      "Only the workspace owner can cancel invitations.",
      403,
      ErrorCode.INSUFFICIENT_PERMISSIONS
    );
  }

  const invitation =
    await WorkspaceRepository.findInvitationById(
      invitationId
    );

  if (!invitation) {
    throw new AppError(
      "Invitation not found.",
      404,
      ErrorCode.INVITATION_NOT_FOUND
    );
  }

  if (
    invitation.workspaceId !==
    workspaceId
  ) {
    throw new AppError(
      "Invitation does not belong to this workspace.",
      404,
      ErrorCode.INVITATION_NOT_FOUND
    );
  }

  await WorkspaceAuditRepository.create(tx, {
    workspaceId,
    actorId: ownerId,
    action: AuditAction.INVITATION_CANCELLED,
    entityId: invitation.id,
  });

  await WorkspaceRepository.deleteInvitation(
    tx,
    invitationId
  );

  return {
    invitedUserId:
      invitation.invitedUserId,
  };
}

static async removeMember(
  tx: Prisma.TransactionClient,
  workspaceId: string,
  ownerId: string,
  memberId: string
): Promise<void> {
  const requester =
    await WorkspaceRepository.findById(
      workspaceId,
      ownerId
    );

  if (!requester) {
    throw new AppError(
      "Workspace not found.",
      404,
      ErrorCode.WORKSPACE_NOT_FOUND
    );
  }

  if (
    requester.workspace.workspaceType ===
    WorkspaceType.PERSONAL
  ) {
    throw new AppError(
      "Members cannot be removed from a personal workspace.",
      403,
      ErrorCode.PERSONAL_WORKSPACE_OPERATION_NOT_ALLOWED
    );
  }

  if (
    requester.role !== WorkspaceRole.OWNER
  ) {
    throw new AppError(
      "Only the workspace owner can remove members.",
      403,
      ErrorCode.INSUFFICIENT_PERMISSIONS
    );
  }

  if (ownerId === memberId) {
    throw new AppError(
      "Owner cannot remove themselves.",
      400,
      ErrorCode.INVALID_OPERATION
    );
  }

  const member =
    await WorkspaceRepository.findMember(
      workspaceId,
      memberId
    );

  if (!member) {
    throw new AppError(
      "Member not found.",
      404,
      ErrorCode.MEMBER_NOT_FOUND
    );
  }

  if (
    member.role === WorkspaceRole.OWNER
  ) {
    throw new AppError(
      "Workspace owner cannot be removed.",
      400,
      ErrorCode.INVALID_OPERATION
    );
  }

  await WorkspaceAuditRepository.create(tx, {
  workspaceId,
  actorId: ownerId,
  action: AuditAction.MEMBER_REMOVED,

  entityId: memberId,
});

  await WorkspaceRepository.removeMember(
    tx,
    workspaceId,
    memberId
  );
}

static async leaveWorkspace(
  tx: Prisma.TransactionClient,
  workspaceId: string,
  userId: string
): Promise<void> {
  const membership =
    await WorkspaceRepository.findById(
      workspaceId,
      userId
    );

  if (!membership) {
    throw new AppError(
      "Workspace not found.",
      404,
      ErrorCode.WORKSPACE_NOT_FOUND
    );
  }

  if (
    membership.workspace.workspaceType ===
    WorkspaceType.PERSONAL
  ) {
    throw new AppError(
      "Personal workspace cannot be left.",
      403,
      ErrorCode.PERSONAL_WORKSPACE_OPERATION_NOT_ALLOWED
    );
  }

  if (
    membership.role === WorkspaceRole.OWNER
  ) {
    throw new AppError(
      "Transfer ownership before leaving the workspace.",
      400,
      ErrorCode.INVALID_OPERATION
    );
  }

  await WorkspaceAuditRepository.create(tx, {
  workspaceId,
  actorId: userId,
  action: AuditAction.MEMBER_REMOVED,

  entityId: userId,
});

  await WorkspaceRepository.leaveWorkspace(
    tx,
    workspaceId,
    userId
  );
}

static async transferOwnership(
  tx: Prisma.TransactionClient,
  workspaceId: string,
  ownerId: string,
  newOwnerId: string
): Promise<void> {
  const requester =
    await WorkspaceRepository.findById(
      workspaceId,
      ownerId
    );

  if (!requester) {
    throw new AppError(
      "Workspace not found.",
      404,
      ErrorCode.WORKSPACE_NOT_FOUND
    );
  }

  if (
    requester.workspace.workspaceType ===
    WorkspaceType.PERSONAL
  ) {
    throw new AppError(
      "Personal workspace ownership cannot be transferred.",
      403,
      ErrorCode.PERSONAL_WORKSPACE_OPERATION_NOT_ALLOWED
    );
  }

  if (
    requester.role !== WorkspaceRole.OWNER
  ) {
    throw new AppError(
      "Only the owner can transfer ownership.",
      403,
      ErrorCode.INSUFFICIENT_PERMISSIONS
    );
  }

  if (ownerId === newOwnerId) {
    throw new AppError(
      "User is already the owner.",
      400,
      ErrorCode.INVALID_OPERATION
    );
  }

  const newOwner =
    await WorkspaceRepository.findMember(
      workspaceId,
      newOwnerId
    );

  if (!newOwner) {
    throw new AppError(
      "Target user is not a workspace member.",
      404,
      ErrorCode.MEMBER_NOT_FOUND
    );
  }

  await WorkspaceRepository.updateMemberRole(
    tx,
    workspaceId,
    ownerId,
    WorkspaceRole.ADMIN
  );

  await WorkspaceRepository.updateMemberRole(
    tx,
    workspaceId,
    newOwnerId,
    WorkspaceRole.OWNER
  );

  await WorkspaceAuditRepository.create(tx, {
  workspaceId,
  actorId: ownerId,
  action: AuditAction.OWNERSHIP_TRANSFERRED,

  entityId: newOwnerId,

  metadata: {
    previousOwnerId: ownerId,
    newOwnerId,
  },
});

  await WorkspaceRepository.updateWorkspaceOwner(
    tx,
    workspaceId,
    newOwnerId
  );
}

static async getAuditLogs(
  workspaceId: string,
  userId: string,
  query: AuditQueryDto
): Promise<WorkspaceAuditListResponse> {
  const membership =
    await WorkspaceRepository.findById(
      workspaceId,
      userId
    );

  if (!membership) {
    throw new AppError(
      "Workspace not found.",
      404,
      ErrorCode.WORKSPACE_NOT_FOUND
    );
  }

  const page = query.page;

  const limit = query.limit;

  const {
    logs,
    total,
  } =
    await WorkspaceAuditRepository.findByWorkspace(
      workspaceId,
      page,
      limit
    );

  return {
    logs:
      WorkspaceAuditMapper.toResponseList(
        logs
      ),

    pagination: {
      page,

      limit,

      total,

      totalPages: Math.ceil(
        total / limit
      ),

      hasNext:
        page * limit < total,
    },
  };
}

}