import React, { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Paperclip, Send, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { useConversationMessages, useProjectConversation, useSendMessage } from '../hooks/useCommunication';

export const ProjectCommunicationTab: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  const conversation = useProjectConversation(projectId!);
  const messages = useConversationMessages(projectId!, conversation.data?.id);
  const send = useSendMessage(projectId!, conversation.data?.id);

  const submit = async () => {
    if (!content.trim() && files.length === 0) return;
    try {
      await send.mutateAsync({ content, files });
      setContent(''); setFiles([]);
    } catch (error: any) { toast.error(error?.message ?? 'Unable to send message.'); }
  };

  if (conversation.isLoading || messages.isLoading) return <Card style={{ padding: 'var(--space-24)' }}>Loading conversation…</Card>;
  if (conversation.isError) return <Card style={{ padding: 'var(--space-24)' }}>This conversation is not available yet.</Card>;

  return <Card style={{ overflow: 'hidden' }}>
    <div style={{ padding: 'var(--space-20)', borderBottom: '1px solid var(--color-border)' }}>
      <h3 style={{ margin: 0 }}>Project conversation</h3>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 4 }}>Share updates, decisions, and delivery context with the project team.</p>
    </div>
    <div style={{ minHeight: 360, maxHeight: 520, overflowY: 'auto', padding: 'var(--space-20)', display: 'flex', flexDirection: 'column-reverse', gap: 'var(--space-12)' }}>
      {[...(messages.data?.messages ?? [])].reverse().map((message) => <div key={message.id} style={{ padding: 'var(--space-12)', borderRadius: 'var(--radius-md)', background: 'var(--color-surface-subtle)' }}>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 4 }}>{message.sender.firstName ?? message.sender.username ?? 'Project member'} · {new Date(message.createdAt).toLocaleString()}</div>
        {message.content && <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>}
        {message.attachments.map((attachment) => <a key={attachment.id} href={attachment.url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', gap: 4, marginTop: 8, fontSize: 'var(--text-sm)' }}><FileText size={14} />{attachment.originalFileName ?? attachment.fileName ?? 'Attachment'}</a>)}
      </div>)}
      {!messages.data?.messages.length && <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', margin: 'auto' }}>No messages yet. Start the conversation.</p>}
    </div>
    <div style={{ borderTop: '1px solid var(--color-border)', padding: 'var(--space-16)' }}>
      {files.length > 0 && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>{files.map((file, index) => <span key={`${file.name}-${index}`} style={{ fontSize: 'var(--text-xs)', background: 'var(--color-primary-soft)', padding: '4px 8px', borderRadius: 999 }}>{file.name} <button onClick={() => setFiles((all) => all.filter((_, i) => i !== index))}><X size={12} /></button></span>)}</div>}
      <textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Write a message…" rows={3} style={{ width: '100%', resize: 'vertical', padding: 'var(--space-12)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', background: 'var(--color-surface)' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}><Button variant="ghost" size="sm" onClick={() => fileInput.current?.click()}><Paperclip size={15} /> Attach</Button><input ref={fileInput} type="file" multiple hidden onChange={(event) => setFiles((current) => [...current, ...Array.from(event.target.files ?? [])])} /><Button size="sm" onClick={submit} disabled={send.isPending}><Send size={15} /> {send.isPending ? 'Sending…' : 'Send'}</Button></div>
    </div>
  </Card>;
};
