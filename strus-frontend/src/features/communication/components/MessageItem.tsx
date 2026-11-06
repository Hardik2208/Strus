
import React, { useEffect, useState } from 'react';

import {
  Check,
  Copy,
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';

import toast from 'react-hot-toast';

import { Button } from '../../../components/ui/Button';
import { useAuthStore } from '../../auth/store/auth.store';

import type { WorkspaceRole } from '../../workspace/types/workspace.types';
import type { Message } from '../types/communication.types';

import { MessageAttachmentItem } from './MessageAttachmentItem';

import {
  useEditMessage,
  useDeleteMessage,
} from '../hooks/useCommunication';

interface MessageItemProps {
  message: Message;
  currentRole: WorkspaceRole;
  senderRole?: WorkspaceRole;
  scope?: 'workspace' | 'project';
}

const EDIT_WINDOW_MS = 15 * 60 * 1000;

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  currentRole,
  senderRole,
  scope = 'workspace',
}) => {
  const currentUserId = useAuthStore(
    (state) => state.user?.id
  );

  const editMutation = useEditMessage();
  const deleteMutation = useDeleteMessage();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(
    message.content ?? ''
  );

  const [withinEditWindow, setWithinEditWindow] = useState(
    Date.now() - new Date(message.createdAt).getTime() <
      EDIT_WINDOW_MS
  );

  // Normalize role values in case the API returns lowercase strings.
  const normalizedCurrentRole = String(currentRole).toUpperCase();
  const normalizedSenderRole = senderRole
    ? String(senderRole).toUpperCase()
    : undefined;

  const isDeleted = message.status === 'DELETED';

  const isOwnMessage =
    Boolean(currentUserId) &&
    message.sender.id === currentUserId;

  useEffect(() => {
    const expiresAt =
      new Date(message.createdAt).getTime() +
      EDIT_WINDOW_MS;

    const remaining = expiresAt - Date.now();

    if (remaining <= 0) {
      setWithinEditWindow(false);
      return;
    }

    const timeout = window.setTimeout(() => {
      setWithinEditWindow(false);
      setIsEditing(false);
      setMenuOpen(false);
    }, remaining);

    return () => window.clearTimeout(timeout);
  }, [message.createdAt]);

  // Only the message author can edit, and only within 15 minutes.
  const canEdit =
    isOwnMessage &&
    !isDeleted &&
    withinEditWindow &&
    Boolean(message.content);

  /*
   * Workspace deletion permissions:
   *
   * OWNER:
   * - Can delete any other member's message.
   *
   * ADMIN:
   * - Can delete MEMBER messages.
   * - Cannot delete OWNER or another ADMIN's messages.
   *
   * MEMBER:
   * - Cannot delete another member's message.
   *
   * Own-message deletion is allowed for every role.
   */
  const canModerateOtherMessage =
  scope === 'workspace' &&
  !isOwnMessage &&
  (
    normalizedCurrentRole === 'OWNER' ||
    (
      normalizedCurrentRole === 'ADMIN' &&
      normalizedSenderRole === 'MEMBER'
    )
  );

const canDelete =
  !isDeleted &&
  (
    isOwnMessage ||
    canModerateOtherMessage
  );

  const hasMessageContent =
    Boolean(message.content?.trim());

  const hasAttachments =
    message.attachments.length > 0;

  const hasMenuActions =
    canEdit ||
    canDelete ||
    hasMessageContent;

  const senderName =
    message.sender.firstName ||
    message.sender.username ||
    'Workspace member';

  const wasEdited =
    !isDeleted &&
    new Date(message.updatedAt).getTime() >
      new Date(message.createdAt).getTime();

  const saveEdit = async () => {
    const trimmedContent = editedContent.trim();

    if (!trimmedContent) {
      toast.error('Message cannot be empty.');
      return;
    }

    if (!withinEditWindow) {
      toast.error(
        'Messages can only be edited within 15 minutes.'
      );
      setIsEditing(false);
      return;
    }

    try {
      await editMutation.mutateAsync({
        messageId: message.id,
        content: trimmedContent,
      });

      setIsEditing(false);
      toast.success('Message updated.');
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          'Unable to update message.'
      );
    }
  };

  const confirmDelete = async () => {
    if (!canDelete) return;

    const confirmed = window.confirm(
      'Delete this message? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(message.id);

      setMenuOpen(false);
      toast.success('Message deleted.');
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          'Unable to delete message.'
      );
    }
  };

  const copyMessage = async () => {
    if (!message.content) return;

    try {
      await navigator.clipboard.writeText(message.content);
      setMenuOpen(false);
      toast.success('Message copied.');
    } catch {
      toast.error('Unable to copy message.');
    }
  };

  return (
    <article
      style={{
        padding: 'var(--space-12)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--color-surface-subtle)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div
          style={{
            minWidth: 0,
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            marginBottom: 8,
          }}
        >
          <strong
            style={{
              color: 'var(--color-text-primary)',
            }}
          >
            {senderName}
          </strong>

          {' · '}

          {new Date(message.createdAt).toLocaleString()}

          {wasEdited && (
            <span
              style={{
                marginLeft: 6,
                fontStyle: 'italic',
              }}
            >
              (edited)
            </span>
          )}
        </div>

        {hasMenuActions && (
          <div
            style={{
              position: 'relative',
              flexShrink: 0,
            }}
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label="Message actions"
              aria-expanded={menuOpen}
              onClick={() =>
                setMenuOpen((open) => !open)
              }
            >
              <MoreHorizontal size={17} />
            </Button>

            {menuOpen && (
              <div
                role="menu"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  zIndex: 20,
                  minWidth: 160,
                  padding: 6,
                  display: 'grid',
                  gap: 4,
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                {canEdit && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setEditedContent(
                        message.content ?? ''
                      );
                      setIsEditing(true);
                      setMenuOpen(false);
                    }}
                    style={menuItemStyle}
                  >
                    <Pencil size={14} />
                    Edit message
                  </button>
                )}

                {hasMessageContent && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => void copyMessage()}
                    style={menuItemStyle}
                  >
                    <Copy size={14} />
                    Copy message
                  </button>
                )}

                {canDelete && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => void confirmDelete()}
                    disabled={deleteMutation.isPending}
                    style={{
                      ...menuItemStyle,
                      color: '#dc2626',
                    }}
                  >
                    <Trash2 size={14} />
                    {deleteMutation.isPending
                      ? 'Deleting…'
                      : 'Delete message'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {isDeleted ? (
        <p
          style={{
            margin: 0,
            color: 'var(--color-text-muted)',
            fontStyle: 'italic',
          }}
        >
          This message was deleted.
        </p>
      ) : isEditing ? (
        <div style={{ display: 'grid', gap: 8 }}>
          <textarea
            autoFocus
            value={editedContent}
            onChange={(event) =>
              setEditedContent(event.target.value)
            }
            rows={3}
            maxLength={5000}
            aria-label="Edit message"
            onKeyDown={(event) => {
              if (
                event.key === 'Enter' &&
                !event.shiftKey
              ) {
                event.preventDefault();
                void saveEdit();
              }

              if (event.key === 'Escape') {
                setIsEditing(false);
                setEditedContent(message.content ?? '');
              }
            }}
            style={{
              width: '100%',
              resize: 'vertical',
              padding: 'var(--space-12)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              font: 'inherit',
            }}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8,
            }}
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsEditing(false);
                setEditedContent(message.content ?? '');
              }}
              disabled={editMutation.isPending}
            >
              <X size={14} />
              Cancel
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={() => void saveEdit()}
              disabled={
                editMutation.isPending ||
                !editedContent.trim()
              }
            >
              <Check size={14} />
              {editMutation.isPending
                ? 'Saving…'
                : 'Save'}
            </Button>
          </div>
        </div>
      ) : (
        <>
          {message.content && (
            <div
              style={{
                whiteSpace: 'pre-wrap',
                overflowWrap: 'anywhere',
              }}
            >
              {message.content}
            </div>
          )}

          {hasAttachments &&
            message.attachments.map((attachment) => (
              <MessageAttachmentItem
                key={attachment.id}
                attachment={attachment}
              />
            ))}
        </>
      )}
    </article>
  );
};

const menuItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  width: '100%',
  padding: '8px 10px',
  border: 0,
  borderRadius: 6,
  background: 'transparent',
  color: 'var(--color-text-primary)',
  textAlign: 'left',
  font: 'inherit',
  fontSize: 'var(--text-sm)',
  cursor: 'pointer',
};
