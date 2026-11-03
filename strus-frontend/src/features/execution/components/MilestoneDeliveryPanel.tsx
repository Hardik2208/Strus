import React, { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, FileUp, Send, Timer } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../../components/ui/Button';
import { executionService } from '../api/execution.service';
import type { Milestone } from '../types/execution.types';
import { MilestoneResolutionPanel } from '../../resolution/components/MilestoneResolutionPanel';

export const MilestoneDeliveryPanel: React.FC<{ milestone: Milestone; isCreator: boolean }> = ({ milestone, isCreator }) => {
  const client = useQueryClient();
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [revision, setRevision] = useState<Record<string, string>>({});
  const [extension, setExtension] = useState(false);
  const [daysAdded, setDaysAdded] = useState(1);
  const [reason, setReason] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const key = ['execution', milestone.projectId, 'submissions', milestone.id] as const;
  const submissions = useQuery({ queryKey: key, queryFn: async () => (await executionService.getMilestoneSubmissions(milestone.id)).data });
  const refresh = () => { client.invalidateQueries({ queryKey: key }); client.invalidateQueries({ queryKey: ['execution', milestone.projectId, 'plan'] }); };
  const submit = useMutation({ mutationFn: () => executionService.submitWork(milestone.id, content, files), onSuccess: () => { setContent(''); setFiles([]); refresh(); toast.success('Work submitted for review.'); } });
  const approve = useMutation({ mutationFn: (id: string) => executionService.approveSubmission(id), onSuccess: () => { refresh(); toast.success('Submission approved.'); } });
  const requestRevision = useMutation({ mutationFn: (id: string) => executionService.requestRevision(id, revision[id] ?? ''), onSuccess: () => { setRevision({}); refresh(); toast.success('Revision requested.'); } });
  const grantExtension = useMutation({ mutationFn: () => executionService.grantExtension(milestone.projectId, milestone.id, daysAdded, reason), onSuccess: () => { setExtension(false); setReason(''); refresh(); toast.success('Extension granted.'); } });
  const canSubmit = !isCreator && ['IN_PROGRESS', 'REVISION_REQUESTED'].includes(milestone.status);

  return <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16, marginTop: 4 }}>
    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 8 }}>Delivery & review</div>
    {submissions.isLoading ? <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Loading submissions…</span> : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{submissions.data?.map((submission) => <div key={submission.id} style={{ padding: 10, borderRadius: 'var(--radius-sm)', background: 'var(--color-surface)' }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 'var(--text-sm)', fontWeight: 600 }}><span>Submission #{submission.submissionNumber}</span><span style={{ color: 'var(--color-text-secondary)' }}>{submission.status.replaceAll('_', ' ')}</span></div>{submission.content && <p style={{ fontSize: 'var(--text-sm)', marginTop: 4 }}>{submission.content}</p>}{submission.attachments.map((file) => <a key={file.id} href={file.url} target="_blank" rel="noreferrer" style={{ display: 'block', fontSize: 'var(--text-xs)', marginTop: 4 }}>{file.originalName}</a>)}{isCreator && submission.status === 'SUBMITTED' && <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}><Button size="sm" onClick={() => approve.mutate(submission.id)} disabled={approve.isPending}><Check size={14} /> Approve</Button><input value={revision[submission.id] ?? ''} onChange={(event) => setRevision((values) => ({ ...values, [submission.id]: event.target.value }))} placeholder="Revision requirements" style={{ flex: 1, minWidth: 180, padding: '6px 8px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} /><Button size="sm" variant="outline" disabled={!revision[submission.id]?.trim() || requestRevision.isPending} onClick={() => requestRevision.mutate(submission.id)}>Request revision</Button></div>}</div>)}</div>}
    {canSubmit && <div style={{ marginTop: 12, padding: 12, background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)' }}><textarea value={content} onChange={(event) => setContent(event.target.value)} rows={2} placeholder="Describe this delivery (optional)" style={{ width: '100%', padding: 8, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'var(--color-surface)' }} /><div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}><Button size="sm" variant="ghost" onClick={() => input.current?.click()}><FileUp size={14} /> Attach {files.length ? `(${files.length})` : ''}</Button><input ref={input} hidden type="file" multiple onChange={(event) => setFiles((all) => [...all, ...Array.from(event.target.files ?? [])])} /><Button size="sm" onClick={() => submit.mutate()} disabled={submit.isPending}><Send size={14} /> {submit.isPending ? 'Submitting…' : 'Submit work'}</Button></div></div>}
    {isCreator && <div style={{ marginTop: 12 }}>{extension ? <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><input type="number" min={1} value={daysAdded} onChange={(event) => setDaysAdded(Number(event.target.value))} style={{ width: 64, padding: 6, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} /><input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Reason (at least 10 characters)" style={{ flex: 1, minWidth: 180, padding: 6, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} /><Button size="sm" disabled={reason.trim().length < 10 || grantExtension.isPending} onClick={() => grantExtension.mutate()}>Grant</Button></div> : <Button size="sm" variant="ghost" onClick={() => setExtension(true)}><Timer size={14} /> Grant extension</Button>}</div>}
    <MilestoneResolutionPanel milestoneId={milestone.id} />
  </div>;
};
