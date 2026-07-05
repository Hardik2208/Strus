import { profileRepository } from "../repositories/profile.repository.js";

import { ProfileSearchMapper } from "../mappers/profile-search.mapper.js";

import type { SearchProfileQueryDto } from "../dtos/search-profile-query.dto.js";
import type { ProfileSearchResponse } from "../interfaces/profile-search-response.interface.js";

export class SearchService {
  private static readonly DEFAULT_PAGE = 1;

  private static readonly LIMIT = 5;

  static async searchProfiles(
    dto: SearchProfileQueryDto
  ): Promise<ProfileSearchResponse> {
    // ------------------------------------------
    // Normalize Query
    // ------------------------------------------

    const query = dto.q.trim().toLowerCase();

    // ------------------------------------------
    // Empty Query
    // ------------------------------------------

    if (!query) {
      return ProfileSearchMapper.toResponse(
        [],
        SearchService.DEFAULT_PAGE,
        0
      );
    }

    // ------------------------------------------
    // Pagination
    // ------------------------------------------

    const page = Math.max(
      Number(dto.page) || SearchService.DEFAULT_PAGE,
      1
    );

    // ------------------------------------------
    // Repository
    // ------------------------------------------

    const { items, total } =
      await profileRepository.searchProfiles(
        query,
        page,
        SearchService.LIMIT
      );

    // ------------------------------------------
    // Mapper
    // ------------------------------------------

    return ProfileSearchMapper.toResponse(
      items,
      page,
      total
    );
  }
}