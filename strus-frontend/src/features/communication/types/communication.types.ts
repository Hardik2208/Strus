export interface Conversation {
  id: string;
  type: 'WORKSPACE' | 'PROJECT';
  status: string;
  latestSequence: number;
  lastReadSequence: number;
  unreadCount: number;
}

export interface MessageAttachment {
  id: string;
  url: string;
  fileName?: string;
  originalFileName?: string;
  mimeType: string;
  fileSize?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  sequence: number;
  type: string;
  status: string;
  content: string | null;
  createdAt: string;
  updatedAt: string;
  sender: { id: string; username?: string; firstName?: string; lastName?: string; avatarUrl?: string | null };
  attachments: MessageAttachment[];
}

export interface MessagePage {
  messages: Message[];
  pagination: { nextCursor: string | null; hasMore: boolean };
}
