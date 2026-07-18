import type {
  NextFunction,
  Response,
} from "express";
import type { WorkspaceInvitationParamDto } from "../dtos/workspace-invitation-param.dto.js";
import { prisma } from "../../../core/database/prisma.js";
import type { UpdateWorkspaceDto } from "../dtos/update-workspace.dto.js";
import { WorkspaceMemberCache } from "../cache/workspace-member.cache.js";
import { WorkspaceRole } from "../../../generated/prisma/enums.js";
import type { WorkspaceIdParamDto } from "../dtos/workspace-id-param.dto.js"
import type { AuthenticatedRequest } from "../../auth/interfaces/auth.interface.js";
import type { WorkspaceMemberParamDto } from "../dtos/workspace-member-param.dto.js";
import type { UpdateMemberRoleDto } from "../dtos/update-member-role.dto.js";
import type { CreateWorkspaceDto } from "../dtos/create-workspace.dto.js";
import type { CreateWorkspaceInvitationDto } from "../dtos/create-workspace-invitation.dto.js";
import type { WorkspaceInvitationDeleteParamDto } from "../dtos/workspace-invitation-delete-param.dto.js"
import type { TransferWorkspaceOwnershipDto } from "../dtos/transfer-workspace-ownership.dto.js"
import { WorkspaceInvitationCache } from "../cache/workspace-invitation.cache.js";
import { WorkspaceCache } from "../cache/workspace.cache.js";
import { WorkspaceMapper } from "../mappers/workspace.mapper.js";
import { WorkspaceService } from "../services/workspace.service.js";
import { memberSearchQuerySchema } from "../dtos/member-search-query.dto.js";
import {
  invitationQuerySchema,
} from "../dtos/invitation-query.dto.js";
import {
  auditQuerySchema,
} from "../dtos/audit-query.dto.js";
import { getIO } from "../../../core/socket/socket.js";
import type { RemoveMemberParamDto } from "../dtos/remove-member-param.dto.js";
import { SocketEvents } from "../../../core/socket/socket-events.js";

export class WorkspaceController {
  // ==================================================
  // Create Workspace
  // ==================================================

  static async create(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user.id;

      const dto = req.body as CreateWorkspaceDto;

      const workspace = await prisma.$transaction(
        async (tx) => {
          return WorkspaceService.createTeamWorkspace(
            tx,
            userId,
            dto
          );
        }
      );

      await WorkspaceCache.invalidate(userId);
      await WorkspaceCache.invalidateDashboard(userId);

      res.status(201).json({
        success: true,
        message: "Workspace created successfully.",
        data: WorkspaceMapper.toResponse(
          workspace,
          WorkspaceRole.OWNER
        ),
      });
    } catch (error) {
      next(error);
    }
  }

  // ==================================================
  // Get My Workspaces
  // ==================================================

  static async getAll(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user.id;

      const cached =
        await WorkspaceCache.get(userId);

      if (cached) {
        res.status(200).json({
          success: true,
          data: cached,
        });

        return;
      }

      const workspaces =
        await WorkspaceService.getUserWorkspaces(
          userId
        );

      await WorkspaceCache.set(
        userId,
        workspaces
      );

      res.status(200).json({
        success: true,
        data: workspaces,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(
  req: AuthenticatedRequest<WorkspaceIdParamDto>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user.id;

    const { workspaceId } = req.params;

    const cached =
      await WorkspaceCache.getWorkspace(
        workspaceId
      );

    if (cached) {
      res.status(200).json({
        success: true,
        data: cached,
      });

      return;
    }

    const workspace =
      await WorkspaceService.getWorkspace(
        workspaceId,
        userId
      );

    await WorkspaceCache.setWorkspace(
      workspaceId,
      workspace
    );

    res.status(200).json({
      success: true,
      data: workspace,
    });
  } catch (error) {
    next(error);
  }
}

static async update(
  req: AuthenticatedRequest<WorkspaceIdParamDto>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user.id;

    const { workspaceId } = req.params;

    const dto =
      req.body as UpdateWorkspaceDto;

    const workspace =
      await prisma.$transaction(async (tx) => {
        return WorkspaceService.updateWorkspace(
          tx,
          workspaceId,
          userId,
          dto
        );
      });

    await Promise.all([
      WorkspaceCache.invalidate(userId),
      WorkspaceCache.invalidateWorkspace(
        workspaceId
      ),
    ]);

    res.status(200).json({
      success: true,
      message: "Workspace updated successfully.",
      data: WorkspaceMapper.toResponse(
        workspace,
        WorkspaceRole.OWNER
      ),
    });
  } catch (error) {
    next(error);
  }
}

static async delete(
  req: AuthenticatedRequest<WorkspaceIdParamDto>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user.id;

    const { workspaceId } = req.params;

    await prisma.$transaction(async (tx) => {
      await WorkspaceService.deleteWorkspace(
        tx,
        workspaceId,
        userId
      );
    });

    await Promise.all([
      WorkspaceCache.invalidate(userId),
      WorkspaceCache.invalidateWorkspace(
        workspaceId
      ),
    ]);

    res.status(200).json({
      success: true,
      message: "Workspace deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}

static async getMembers(
  req: AuthenticatedRequest<WorkspaceIdParamDto>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user.id;

    const { workspaceId } = req.params;

    const query =
      memberSearchQuerySchema.parse(req.query);

    const members =
      await WorkspaceService.getWorkspaceMembers(
        workspaceId,
        userId,
        query
      );

    res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error) {
    next(error);
  }
}

static async updateMemberRole(
  req: AuthenticatedRequest<
    WorkspaceMemberParamDto,
    unknown,
    UpdateMemberRoleDto
  >,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const ownerId = req.user.id;

    const {
      workspaceId,
      memberId,
    } = req.params;

    const dto = req.body;

    await prisma.$transaction(
      async (tx) =>
        WorkspaceService.updateMemberRole(
          tx,
          workspaceId,
          ownerId,
          memberId,
          dto
        )
    );

    getIO()
      .to(`workspace:${workspaceId}`)
      .emit(
        SocketEvents.MEMBER_ROLE_UPDATED,
        {
          workspaceId,
          memberId,
          role: dto.role,
        }
      );

    await WorkspaceMemberCache.invalidateWorkspace(
  workspaceId
);

    res.status(200).json({
      success: true,
      message:
        "Member role updated successfully.",
    });
  } catch (error) {
    next(error);
  }
}

static async createInvitation(
  req: AuthenticatedRequest<
    WorkspaceIdParamDto,
    unknown,
    CreateWorkspaceInvitationDto
  >,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const ownerId = req.user.id;

    const { workspaceId } =
      req.params;

    const dto = req.body;

    const invitation =
      await prisma.$transaction(
        async (tx) =>
          WorkspaceService.createInvitation(
            tx,
            workspaceId,
            ownerId,
            dto
          )
      );

      getIO()
  .to(`user:${invitation.invitedUserId}`)
  .emit(
    SocketEvents.INVITATION_CREATED,
    invitation
  );
    await WorkspaceInvitationCache.invalidateWorkspace(
  workspaceId
);

    res.status(201).json({
      success: true,

      message:
        "Invitation created successfully.",

      data: invitation,
    });
  } catch (error) {
    next(error);
  }
}

static async getInvitations(
  req: AuthenticatedRequest<WorkspaceIdParamDto>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user.id;

    const { workspaceId } = req.params;

    const query =
      invitationQuerySchema.parse(req.query);

    const invitations =
      await WorkspaceService.getWorkspaceInvitations(
        workspaceId,
        userId,
        query
      );

    res.status(200).json({
      success: true,
      data: invitations,
    });
  } catch (error) {
    next(error);
  }
}

static async acceptInvitation(
  req: AuthenticatedRequest<WorkspaceInvitationParamDto>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user.id;

    const { invitationId } = req.params;

    const result =
      await prisma.$transaction(async (tx) =>
        WorkspaceService.acceptInvitation(
          tx,
          invitationId,
          userId
        )
      );

    const sockets =
  await getIO()
    .in(`user:${userId}`)
    .fetchSockets();

for (const socket of sockets) {
  socket.join(
    `workspace:${result.workspaceId}`
  );
}

    getIO()
      .to(`workspace:${result.workspaceId}`)
      .emit(
        SocketEvents.MEMBER_JOINED,
        {
          workspaceId: result.workspaceId,
          userId,
        }
      );

    await Promise.all([
  WorkspaceCache.invalidate(userId),

  WorkspaceMemberCache.invalidateWorkspace(
    result.workspaceId
  ),

  WorkspaceInvitationCache.invalidateWorkspace(
    result.workspaceId
  ),
]);

    res.status(200).json({
      success: true,
      message:
        "Invitation accepted successfully.",
    });
  } catch (error) {
    next(error);
  }
}

static async declineInvitation(
  req: AuthenticatedRequest<WorkspaceInvitationParamDto>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user.id;

    const { invitationId } =
      req.params;

    const result =
      await prisma.$transaction(
        async (tx) =>
          WorkspaceService.declineInvitation(
            tx,
            invitationId,
            userId
          )
      );

    getIO()
      .to(`workspace:${result.workspaceId}`)
      .emit(
        SocketEvents.INVITATION_DECLINED,
        {
          invitationId,
        }
      );

    await WorkspaceInvitationCache.invalidateWorkspace(
  result.workspaceId
);

    res.status(200).json({
      success: true,
      message:
        "Invitation declined successfully.",
    });
  } catch (error) {
    next(error);
  }
}

static async cancelInvitation(
  req: AuthenticatedRequest<WorkspaceInvitationDeleteParamDto>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const ownerId = req.user.id;

    const {
      workspaceId,
      invitationId,
    } = req.params;

    const result =
      await prisma.$transaction(
        async (tx) =>
          WorkspaceService.cancelInvitation(
            tx,
            workspaceId,
            ownerId,
            invitationId
          )
      );

    getIO()
      .to(`user:${result.invitedUserId}`)
      .emit(
        SocketEvents.INVITATION_CANCELLED,
        {
          invitationId,
        }
      );

    await WorkspaceInvitationCache.invalidateWorkspace(
  workspaceId
);

    res.status(200).json({
      success: true,
      message:
        "Invitation cancelled successfully.",
    });
  } catch (error) {
    next(error);
  }
}

static async removeMember(
  req: AuthenticatedRequest<RemoveMemberParamDto>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const ownerId = req.user.id;

    const {
      workspaceId,
      memberId,
    } = req.params;

    await prisma.$transaction(
      async (tx) =>
        WorkspaceService.removeMember(
          tx,
          workspaceId,
          ownerId,
          memberId
        )
    );

    const sockets =
  await getIO()
    .in(`user:${memberId}`)
    .fetchSockets();

for (const socket of sockets) {
  socket.leave(
    `workspace:${workspaceId}`
  );
}

    getIO()
      .to(`workspace:${workspaceId}`)
      .emit(
        SocketEvents.MEMBER_REMOVED,
        {
          workspaceId,
          memberId,
        }
      );

    await WorkspaceMemberCache.invalidateWorkspace(
  workspaceId
);

    res.status(200).json({
      success: true,
      message:
        "Member removed successfully.",
    });
  } catch (error) {
    next(error);
  }
}

static async leaveWorkspace(
  req: AuthenticatedRequest<WorkspaceIdParamDto>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user.id;

    const { workspaceId } =
      req.params;

    await prisma.$transaction(
      async (tx) =>
        WorkspaceService.leaveWorkspace(
          tx,
          workspaceId,
          userId
        )
    );

    const sockets =
  await getIO()
    .in(`user:${userId}`)
    .fetchSockets();

for (const socket of sockets) {
  socket.leave(
    `workspace:${workspaceId}`
  );
}

    await Promise.all([
      WorkspaceCache.invalidate(userId),
      WorkspaceMemberCache.invalidateWorkspace(
  workspaceId
),
    ]);

    res.status(200).json({
      success: true,
      message:
        "Left workspace successfully.",
    });
  } catch (error) {
    next(error);
  }
}

static async transferOwnership(
  req: AuthenticatedRequest<
    WorkspaceIdParamDto,
    unknown,
    TransferWorkspaceOwnershipDto
  >,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const ownerId = req.user.id;

    const { workspaceId } =
      req.params;

    const dto = req.body;

    await prisma.$transaction(
      async (tx) =>
        WorkspaceService.transferOwnership(
          tx,
          workspaceId,
          ownerId,
          dto.newOwnerId
        )
    );

    getIO()
      .to(`workspace:${workspaceId}`)
      .emit(
        SocketEvents.OWNERSHIP_TRANSFERRED,
        {
          workspaceId,
          previousOwnerId: ownerId,
          newOwnerId: dto.newOwnerId,
        }
      );

    await Promise.all([
      WorkspaceCache.invalidate(
        ownerId
      ),

      WorkspaceCache.invalidate(
        dto.newOwnerId
      ),

      WorkspaceMemberCache.invalidateWorkspace(
  workspaceId
),
    ]);

    res.status(200).json({
      success: true,
      message:
        "Workspace ownership transferred successfully.",
    });
  } catch (error) {
    next(error);
  }
}

static async getAuditLogs(
  req: AuthenticatedRequest<WorkspaceIdParamDto>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user.id;

    const { workspaceId } =
      req.params;

    const query =
      auditQuerySchema.parse(
        req.query
      );

    const logs =
      await WorkspaceService.getAuditLogs(
        workspaceId,
        userId,
        query
      );

    res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
}

}