export interface UpdateProfileResponse {
  id: string;

  username: string;

  firstName: string;

  lastName: string;

  bio: string | null;

  avatarUrl: string | null;

  countryCode: string;

  timezone: string;

  createdAt: Date;

  updatedAt: Date;
}