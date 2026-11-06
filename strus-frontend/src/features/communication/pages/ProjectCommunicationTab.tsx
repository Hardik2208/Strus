import React, {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { useParams } from 'react-router-dom';

import {
  Paperclip,
  Send,
  X,
} from 'lucide-react';

import toast from 'react-hot-toast';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';

import { MessageItem } from '../components/MessageItem';

import { useProjectCommunicationRealtime } from '../hooks/useProjectCommunicationRealtime';

import {
  useProjectConversation,
  useProjectConversationMessages,
  useSendProjectMessage,
} from '../hooks/useCommunication';

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_TOTAL_SIZE = 40 * 1024 * 1024;

const ACCEPTED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.csv',
  '.ppt',
  '.pptx',
  '.txt',
  '.json',
  '.md',
];

const ACCEPTED_FILE_TYPES =
  ACCEPTED_EXTENSIONS.join(',');

export const ProjectCommunicationTab: React.FC = () => {
  const { projectId } = useParams<{
    projectId: string;
  }>();

  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const fileInput = useRef<HTMLInputElement>(null);
  const messagesContainerRef =
    useRef<HTMLDivElement>(null);
  const messagesEndRef =
    useRef<HTMLDivElement>(null);

  const isNearBottomRef = useRef(true);
  const initialScrollDoneRef = useRef(false);
  const previousMessageCountRef = useRef(0);
  const previousScrollHeightRef =
    useRef<number | null>(null);

  const conversation = useProjectConversation(
    projectId || ''
  );

  const conversationId = conversation.data?.id;

  useProjectCommunicationRealtime(
    projectId || '',
    conversationId
  );

  const messages = useProjectConversationMessages(
    projectId || '',
    conversationId
  );

  const send = useSendProjectMessage(
    projectId || '',
    conversationId
  );

  const allMessages =
    messages.data?.pages.flatMap(
      (page) => page.messages
    ) ?? [];

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = 'auto') => {
      messagesEndRef.current?.scrollIntoView({
        behavior,
        block: 'end',
      });
    },
    []
  );

  const handleMessagesScroll = useCallback(() => {
    const container = messagesContainerRef.current;

    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight -
      container.scrollTop -
      container.clientHeight;

    isNearBottomRef.current =
      distanceFromBottom < 120;
  }, []);

  // Reset scroll state when switching projects.
  useLayoutEffect(() => {
    initialScrollDoneRef.current = false;
    previousMessageCountRef.current = 0;
    isNearBottomRef.current = true;
    previousScrollHeightRef.current = null;
  }, [conversationId]);

  // Initial load: open at the latest messages.
  useLayoutEffect(() => {
    if (
      !conversationId ||
      messages.isLoading ||
      !messages.data?.pages.length ||
      initialScrollDoneRef.current
    ) {
      return;
    }

    scrollToBottom('auto');

    initialScrollDoneRef.current = true;
    previousMessageCountRef.current =
      allMessages.length;
  }, [
    conversationId,
    messages.isLoading,
    messages.data?.pages.length,
    allMessages.length,
    scrollToBottom,
  ]);

  // New messages: scroll only if the user was already
  // near the bottom.
  useLayoutEffect(() => {
    if (!initialScrollDoneRef.current) return;

    const currentCount = allMessages.length;
    const previousCount =
      previousMessageCountRef.current;

    if (
      currentCount > previousCount &&
      isNearBottomRef.current
    ) {
      scrollToBottom('smooth');
    }

    previousMessageCountRef.current = currentCount;
  }, [allMessages.length, scrollToBottom]);

  // Preserve viewport when older messages are prepended.
  useLayoutEffect(() => {
    const container = messagesContainerRef.current;
    const previousHeight =
      previousScrollHeightRef.current;

    if (!container || previousHeight === null) {
      return;
    }

    container.scrollTop +=
      container.scrollHeight - previousHeight;

    previousScrollHeightRef.current = null;
  }, [messages.data?.pages.length]);

  const handleFileSelection = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = Array.from(
      event.target.files ?? []
    );

    if (!selectedFiles.length) return;

    if (
      selectedFiles.length >
      MAX_FILES - files.length
    ) {
      toast.error(
        `Maximum ${MAX_FILES} files allowed.`
      );
      event.target.value = '';
      return;
    }

    const validFiles: File[] = [];

    let totalSize = files.reduce(
      (total, file) => total + file.size,
      0
    );

    for (const file of selectedFiles) {
      const extension = file.name
        .slice(file.name.lastIndexOf('.'))
        .toLowerCase();

      if (!ACCEPTED_EXTENSIONS.includes(extension)) {
        toast.error(
          `${file.name}: Unsupported file type.`
        );
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error(
          `${file.name}: Maximum size is 10 MB.`
        );
        continue;
      }

      if (totalSize + file.size > MAX_TOTAL_SIZE) {
        toast.error(
          'Combined attachment size cannot exceed 40 MB.'
        );
        continue;
      }

      totalSize += file.size;
      validFiles.push(file);
    }

    setFiles((current) => [
      ...current,
      ...validFiles,
    ]);

    // Allows selecting the same file again.
    event.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles((current) =>
      current.filter((_, i) => i !== index)
    );
  };

  const loadOlderMessages = async () => {
    const container = messagesContainerRef.current;

    if (
      !container ||
      !messages.hasNextPage ||
      messages.isFetchingNextPage
    ) {
      return;
    }

    previousScrollHeightRef.current =
      container.scrollHeight;

    try {
      await messages.fetchNextPage();
    } catch {
      previousScrollHeightRef.current = null;

      toast.error(
        'Unable to load older messages.'
      );
    }
  };

  const submit = async () => {
    if (!content.trim() && files.length === 0) {
      return;
    }

    if (!conversationId) {
      toast.error(
        'Project conversation is unavailable.'
      );
      return;
    }

    if (files.length > MAX_FILES) {
      toast.error('Maximum 5 files allowed.');
      return;
    }

    if (
      files.some(
        (file) => file.size > MAX_FILE_SIZE
      )
    ) {
      toast.error(
        'Each file must be 10 MB or smaller.'
      );
      return;
    }

    const totalSize = files.reduce(
      (total, file) => total + file.size,
      0
    );

    if (totalSize > MAX_TOTAL_SIZE) {
      toast.error(
        'Combined attachment size cannot exceed 40 MB.'
      );
      return;
    }

    try {
      isNearBottomRef.current = true;

      await send.mutateAsync({
        content,
        files,
      });

      setContent('');
      setFiles([]);

      if (fileInput.current) {
        fileInput.current.value = '';
      }

      requestAnimationFrame(() =>
        scrollToBottom('smooth')
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          'Unable to send message.'
      );
    }
  };

  if (!projectId) {
    return <Card>Invalid project.</Card>;
  }

  if (conversation.isLoading) {
    return (
      <Card>Loading project conversation…</Card>
    );
  }

  if (conversation.isError || !conversationId) {
    return (
      <Card>
        Project conversation unavailable.
      </Card>
    );
  }

  if (messages.isLoading) {
    return <Card>Loading messages…</Card>;
  }

  if (messages.isError) {
    return (
      <Card>
        Unable to load project messages.
      </Card>
    );
  }

  return (
    <Card style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div
        style={{
          padding: 'var(--space-20)',
          borderBottom:
            '1px solid var(--color-border)',
        }}
      >
        <h3 style={{ margin: 0 }}>
          Project conversation
        </h3>

        <p
          style={{
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--text-sm)',
            marginTop: 4,
          }}
        >
          Share project updates, decisions, and
          delivery context with the project team.
        </p>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleMessagesScroll}
        style={{
          minHeight: 360,
          maxHeight: 520,
          overflowY: 'auto',
          padding: 'var(--space-20)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-12)',
        }}
      >
        {messages.hasNextPage && (
          <div style={{ textAlign: 'center' }}>
            <Button
              variant="outline"
              size="sm"
              onClick={loadOlderMessages}
              disabled={
                messages.isFetchingNextPage
              }
            >
              {messages.isFetchingNextPage
                ? 'Loading older messages…'
                : 'Load older messages'}
            </Button>
          </div>
        )}

        {allMessages.length === 0 && (
          <p
            style={{
              color: 'var(--color-text-secondary)',
              textAlign: 'center',
              margin: 'auto',
            }}
          >
            No messages yet. Start the conversation.
          </p>
        )}

        {allMessages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            currentRole="MEMBER"
            scope="project"
          />
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <div
        style={{
          borderTop:
            '1px solid var(--color-border)',
          padding: 'var(--space-16)',
        }}
      >
        {files.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              marginBottom: 8,
            }}
          >
            {files.map((file, index) => (
              <span
                key={`${file.name}-${index}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 'var(--text-xs)',
                  background:
                    'var(--color-primary-soft)',
                  padding: '4px 8px',
                  borderRadius: 999,
                }}
              >
                {file.name}

                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  aria-label={`Remove ${file.name}`}
                  style={{
                    border: 0,
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}

        <textarea
          value={content}
          onChange={(event) =>
            setContent(event.target.value)
          }
          onKeyDown={(event) => {
            if (
              event.key === 'Enter' &&
              !event.shiftKey
            ) {
              event.preventDefault();
              void submit();
            }
          }}
          placeholder="Write a message…"
          rows={3}
          style={{
            width: '100%',
            resize: 'vertical',
            padding: 'var(--space-12)',
            border:
              '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-surface)',
          }}
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginTop: 8,
          }}
        >
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                fileInput.current?.click()
              }
            >
              <Paperclip size={15} />
              Attach
            </Button>

            <input
              ref={fileInput}
              type="file"
              multiple
              hidden
              accept={ACCEPTED_FILE_TYPES}
              onChange={handleFileSelection}
            />

            <p
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-secondary)',
                marginTop: 4,
                marginBottom: 0,
              }}
            >
              Max 5 files · 10 MB each · 40 MB total
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => void submit()}
            disabled={send.isPending}
          >
            <Send size={15} />

            {send.isPending
              ? 'Sending…'
              : 'Send'}
          </Button>
        </div>
      </div>
    </Card>
  );
};