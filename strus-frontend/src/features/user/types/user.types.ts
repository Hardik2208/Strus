
export interface MyProfileResponse {
  id: string;
  email: string;
  profileCompleted: boolean;
  verificationLevel: string;
  username: string;
  firstName: string;
  lastName: string;
  bio: string | null;
  avatarUrl: string | null;
  countryCode: string;
  timezone: string;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileResponse {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  bio: string | null;
  avatarUrl: string | null;
  countryCode: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface AvatarResponse {
  avatarUrl: string | null;
  avatarPublicId: string | null;
}

export interface UsernameAvailabilityResponse {
  available: boolean;
  reason?: string;
}

export interface UsernameUpdateResponse {
  username: string;
}

export interface PublicUserIdentity {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export interface ProfileSetupPayload {
  firstName: string;
  lastName: string;
  username: string;
  countryCode: string;
  timezone: string;
  bio?: string;
}

export interface ProfileUpdatePayload {
  firstName?: string;
  lastName?: string;
  countryCode?: string;
  timezone?: string;
  bio?: string | null;
}

export interface UserSearchPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
}

export interface UserSearchResult {
  data: PublicUserIdentity[];
  pagination: UserSearchPagination;
}
