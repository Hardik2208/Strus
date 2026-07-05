import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { SearchService } from "../services/search.service.js";

import type { SearchProfileQueryDto } from "../dtos/search-profile-query.dto.js";

export class SearchController {
  static async search(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const dto: SearchProfileQueryDto = {
        q: String(req.query.q ?? ""),

        page: Number(req.query.page) || 1,
      };

      const response =
        await SearchService.searchProfiles(
          dto
        );

      res.status(200).json({
        success: true,
        data: response.data,
        pagination: response.pagination,
        });
    } catch (error) {
      next(error);
    }
  }
}