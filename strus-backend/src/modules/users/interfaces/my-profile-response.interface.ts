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

  lastLoginAt: Date | null;

  createdAt: Date;

  updatedAt: Date;
}