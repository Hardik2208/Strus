export interface ProfileSearchItem {
  id: string;

  username: string;

  firstName: string;

  lastName: string;

  avatarUrl: string | null;
}

export interface ProfileSearchResponse {
  data: ProfileSearchItem[];

  pagination: {
    page: number;

    limit: number;

    total: number;

    totalPages: number;

    hasNext: boolean;
  };
}