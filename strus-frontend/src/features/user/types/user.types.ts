export interface UserProfile {
  id: string;
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  bio: string | null;
  avatarUrl: string | null;
  avatarPublicId: string | null;
  countryCode: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
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
  bio?: string;
}

export interface UsernameAvailabilityResponse {
  available: boolean;
  message?: string;
}
