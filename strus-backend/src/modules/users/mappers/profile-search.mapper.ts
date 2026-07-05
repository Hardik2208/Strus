import type { ProfileSearchResponse } from "../interfaces/profile-search-response.interface.js";

interface SearchProfileResult {
  id: string;

  username: string;

  firstName: string;

  lastName: string;

  avatarUrl: string | null;
}

export class ProfileSearchMapper {
  static toResponse(
    items: SearchProfileResult[],
    page: number,
    total: number
  ): ProfileSearchResponse {
    const limit = 5;

    return {
      data: items,

      pagination: {
        page,

        limit,

        total,

        totalPages: Math.ceil(total / limit),

        hasNext: page * limit < total,
      },
    };
  }
}