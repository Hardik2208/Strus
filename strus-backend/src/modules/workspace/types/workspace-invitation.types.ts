export interface PendingWorkspaceInvitationResponse {
  id: string;

  status: "PENDING";

  expiresAt: Date;

  createdAt: Date;

  workspace: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    workspaceType: string;

    owner: {
      id: string;
      username: string;
      firstName: string;
      lastName: string;
      avatarUrl: string | null;
    };
  };

  invitedBy: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
}