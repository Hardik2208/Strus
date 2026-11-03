import type {
  ProjectAsset,
  ProjectAssetFile,
} from "../../../generated/prisma/client.js";

export class ProjectAssetMapper {
  static toResponse(
    asset: ProjectAsset & {
      files?: ProjectAssetFile[];
      visibleToParticipants?: any[];
      createdBy?: any;
    }
  ) {
    return {
      ...asset,
      files: (asset.files ?? []).map((file) => ({
        ...file,
        size: Number(file.size),
      })),
    };
  }

  static toResponseList(
    assets: Array<
      ProjectAsset & {
        files?: ProjectAssetFile[];
        visibleToParticipants?: any[];
        createdBy?: any;
      }
    >
  ) {
    return assets.map((asset) => this.toResponse(asset));
  }
}
