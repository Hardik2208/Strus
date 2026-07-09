import type {
  Prisma,
  Project,
} from "../../../generated/prisma/client.js";

import { prisma } from "../../../core/database/prisma.js";

import { WorkspaceRole } from "../../../generated/prisma/enums.js";

import type { ListProjectsDto } from "../dtos/list-projects.dto.js";
import type { ProjectStatus } from "../../../generated/prisma/enums.js";


export class ProjectRepository {
  static async create(
    tx: Prisma.TransactionClient,
    data: Prisma.ProjectCreateInput
  ): Promise<Project> {
    return tx.project.create({
      data,
    });
  }

  static async findWorkspaceMembership(
    workspaceId: string,
    userId: string
  ) {
    return prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },

      include: {
        workspace: {
          select: {
            id: true,
            workspaceType: true,
          },
        },
      },
    });
  }

  static async findById(
    projectId: string
  ) {
    return prisma.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
      },

      include: {
        workspace: true,
        createdBy: {
          include: {
            profile: true,
          },
        },
      },
    });
  }

  static async exists(
    projectId: string
  ): Promise<boolean> {
    const project =
      await prisma.project.findFirst({
        where: {
          id: projectId,
          deletedAt: null,
        },

        select: {
          id: true,
        },
      });

    return !!project;
  }

  static async findWorkspaceProjects(
    workspaceId: string,
    userId: string,
    role: WorkspaceRole,
    query: ListProjectsDto
  ) {
    const where: Prisma.ProjectWhereInput = {
      workspaceId,

      deletedAt: null,

      ...(role === WorkspaceRole.MEMBER && {
        createdById: userId,
      }),

      ...(query.status && {
        status: query.status,
      }),

      ...(query.search
        ? {
            OR: [
              {
                title: {
                  contains: query.search,
                  mode: "insensitive",
                },
              },
              {
                description: {
                  contains: query.search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    };

    const [projects, total] =
      await prisma.$transaction([
        prisma.project.findMany({
          where,

          skip:
            (query.page - 1) *
            query.limit,

          take: query.limit,

          orderBy: {
            [query.sort]:
              query.order,
          },
        }),

        prisma.project.count({
          where,
        }),
      ]);

    return {
      projects,
      total,
    };
  }

  static async findProjectById(
    projectId: string
  ) {
    return prisma.project.findFirst({
      where: {
        id: projectId,
        deletedAt: null,
      },

      include: {
        workspace: {
          select: {
            id: true,
          },
        },

        createdBy: {
          include: {
            profile: {
              select: {
                username: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
  }

  static async update(
    tx: Prisma.TransactionClient,
    projectId: string,
    data: Prisma.ProjectUpdateInput
  ) {
    return tx.project.update({
      where: {
        id: projectId,
      },

      data,
    });
  }

  static async softDelete(
    tx: Prisma.TransactionClient,
    projectId: string
  ): Promise<void> {
    await tx.project.update({
      where: {
        id: projectId,
      },

      data: {
        deletedAt: new Date(),
      },
    });
  }

  static async updateStatus(
  tx: Prisma.TransactionClient,
  projectId: string,
  status: ProjectStatus
): Promise<Project> {
  return tx.project.update({
    where: {
      id: projectId,
    },

    data: {
      status,
    },
  });
}

static async transferWorkspace(
  tx: Prisma.TransactionClient,
  projectId: string,
  destinationWorkspaceId: string
): Promise<Project> {
  return tx.project.update({
    where: {
      id: projectId,
    },

    data: {
      workspaceId:
        destinationWorkspaceId,
    },
  });
}
}