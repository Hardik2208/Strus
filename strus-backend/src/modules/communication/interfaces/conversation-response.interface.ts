import type {
  ConversationStatus,
  ConversationType,
  MessageStatus,
  MessageType,
  ProjectStatus,
  ProjectSetupStage,
  WorkspaceType,
} from "../../../generated/prisma/enums.js";

export interface ConversationResponse {
  id: string;

  type: ConversationType;

  status: ConversationStatus;

  workspace: {
    id: string;
    name: string;
    workspaceType: WorkspaceType;
  } | null;

  project: {
    id: string;
    title: string;
    status: ProjectStatus;
    setupStage: ProjectSetupStage;
  } | null;

  latestSequence: number;

  lastReadSequence: number;

  unreadCount: number;

  lastActivityAt: Date | null;

  lastMessage: LastMessageResponse | null;
}

export interface LastMessageResponse {
  id: string;

  sequence: number;

  content: string;

  createdAt: Date;

  sender: {
    id: string;

    profile: {
      firstName: string | null;
      lastName: string | null;
      avatarUrl: string | null;
    } | null;
  };
}