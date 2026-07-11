import { prisma } from "../../../core/database/prisma.js";

import type {
  Prisma,
  ProjectAsset,
} from "../../../generated/prisma/client.js";

export class ProjectAssetRepository {
  // ==================================================
  // Create Asset
  // ==================================================

  static create(
    tx: Prisma.TransactionClient,
    data: Prisma.ProjectAssetCreateInput
  ): Promise<ProjectAsset> {
    return tx.projectAsset.create({
      data,
    });
  }

  // ==================================================
  // Create Asset Files
  // ==================================================

  static createFiles(
    tx: Prisma.TransactionClient,
    data: Prisma.ProjectAssetFileCreateManyInput[]
  ) {
    return tx.projectAssetFile.createMany({
      data,
    });
  }

  // ==================================================
  // Create Visibility
  // ==================================================

  static createVisibility(
    tx: Prisma.TransactionClient,
    data: Prisma.ProjectAssetVisibilityCreateManyInput[]
  ) {
    return tx.projectAssetVisibility.createMany({
      data,
    });
  }

  // ==================================================
  // Get Project Assets
  // ==================================================

  static findProjectAssets(
    projectId: string
  ) {
    return prisma.projectAsset.findMany({
      where: {
        projectId,
        deletedAt: null,
      },

      include: {
        files: {
          orderBy: {
            uploadedAt: "asc",
          },
        },

        visibleToParticipants: {
          include: {
            participant: {
              include: {
                user: {
                  include: {
                    profile: true,
                  },
                },
              },
            },
          },
        },

        createdBy: {
          include: {
            profile: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });
  }

  // ==================================================
  // Get Asset
  // ==================================================

  static findProjectAsset(
    projectId: string,
    assetId: string
  ) {
    return prisma.projectAsset.findFirst({
      where: {
        id: assetId,

        projectId,

        deletedAt: null,
      },

      include: {
        files: {
          orderBy: {
            uploadedAt: "asc",
          },
        },

        visibleToParticipants: {
          include: {
            participant: {
              include: {
                user: {
                  include: {
                    profile: true,
                  },
                },
              },
            },
          },
        },

        createdBy: {
          include: {
            profile: true,
          },
        },
      },
    });
  }

  // ==================================================
  // Add Files
  // ==================================================

  static addFiles(
    tx: Prisma.TransactionClient,
    data: Prisma.ProjectAssetFileCreateManyInput[]
  ) {
    return tx.projectAssetFile.createMany({
      data,
    });
  }

  // ==================================================
  // Delete Visibility
  // ==================================================

  static deleteVisibility(
    tx: Prisma.TransactionClient,
    assetId: string
  ) {
    return tx.projectAssetVisibility.deleteMany({
      where: {
        projectAssetId: assetId,
      },
    });
  }

  // ==================================================
  // Replace Visibility
  // ==================================================

  static replaceVisibility(
    tx: Prisma.TransactionClient,
    assetId: string,
    data: Prisma.ProjectAssetVisibilityCreateManyInput[]
  ) {
    return Promise.all([
      this.deleteVisibility(
        tx,
        assetId
      ),

      tx.projectAssetVisibility.createMany({
        data,
      }),
    ]);
  }

  // ==================================================
  // Soft Delete
  // ==================================================

  static softDelete(
    tx: Prisma.TransactionClient,
    assetId: string
  ) {
    return tx.projectAsset.update({
      where: {
        id: assetId,
      },

      data: {
        deletedAt: new Date(),
      },
    });
  }

  // ==================================================
  // Get Asset Files
  // ==================================================

  static findFiles(
    assetId: string
  ) {
    return prisma.projectAssetFile.findMany({
      where: {
        projectAssetId: assetId,
      },

      orderBy: {
        uploadedAt: "asc",
      },
    });
  }
}