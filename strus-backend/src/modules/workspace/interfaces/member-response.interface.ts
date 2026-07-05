export interface MemberResponse {
  id: string;

  username: string;

  firstName: string;

  lastName: string;

  avatarUrl: string | null;

  role: "OWNER" | "ADMIN" | "MEMBER";

  joinedAt: Date;
}