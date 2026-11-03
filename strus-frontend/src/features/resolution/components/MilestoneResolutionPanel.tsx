import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Gavel, Handshake } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../../components/ui/Button';
import { resolutionService } from '../api/resolution.service';

export const MilestoneResolutionPanel: React.FC<{ milestoneId: string }> = ({ milestoneId }) => {
  const client = useQueryClient();
  const [mode, setMode] = useState<'none' | 'negotiation' | 'dispute'>('none');
  const [reason, setReason] = useState('');
  const [percentage, setPercentage] = useState(0);
  const [resolution, setResolution] = useState('');
  const negotiations = useQuery({ queryKey: ['negotiations', milestoneId], queryFn: async () => (await resolutionService.getNegotiations(milestoneId)).data });
  const disputes = useQuery({ queryKey: ['disputes', milestoneId], queryFn: async () => (await resolutionService.getDisputes(milestoneId)).data });
  const refresh = () => { client.invalidateQueries({ queryKey: ['negotiations', milestoneId] }); client.invalidateQueries({ queryKey: ['disputes', milestoneId] }); };
  const negotiate = useMutation({ mutationFn: () => resolutionService.createNegotiation(milestoneId, { proposedPercentage: percentage, reason }), onSuccess: () => { setMode('none'); setReason(''); refresh(); toast.success('Negotiation submitted.'); } });
  const dispute = useMutation({ mutationFn: () => resolutionService.createDispute(milestoneId, { reason, requestedResolution: resolution || undefined }), onSuccess: () => { setMode('none'); setReason(''); setResolution(''); refresh(); toast.success('Dispute submitted.'); } });
  const negotiationItems = Array.isArray(negotiations.data) ? negotiations.data : (negotiations.data?.items ?? negotiations.data?.negotiations ?? []);
  const disputeItems = Array.isArray(disputes.data) ? disputes.data : (disputes.data?.items ?? disputes.data?.disputes ?? []);
  return <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 16, paddingTop: 16 }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}><div><div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Resolution</div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{negotiationItems.length} negotiation{negotiationItems.length === 1 ? '' : 's'} · {disputeItems.length} dispute{disputeItems.length === 1 ? '' : 's'}</div></div><div style={{ display: 'flex', gap: 6 }}><Button size="sm" variant="ghost" onClick={() => setMode(mode === 'negotiation' ? 'none' : 'negotiation')}><Handshake size={14} /> Negotiate</Button><Button size="sm" variant="ghost" onClick={() => setMode(mode === 'dispute' ? 'none' : 'dispute')}><Gavel size={14} /> Dispute</Button></div></div>{mode !== 'none' && <div style={{ marginTop: 10, padding: 10, background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)' }}>{mode === 'negotiation' && <input type="number" min={0} max={100} value={percentage} onChange={(event) => setPercentage(Number(event.target.value))} placeholder="Proposed percentage" style={{ width: '100%', padding: 7, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', marginBottom: 8 }} />}<textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={2} placeholder={mode === 'negotiation' ? 'Explain your proposed settlement' : 'Explain the issue (at least 10 characters)'} style={{ width: '100%', padding: 7, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />{mode === 'dispute' && <input value={resolution} onChange={(event) => setResolution(event.target.value)} placeholder="Requested resolution (optional)" style={{ width: '100%', padding: 7, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', marginTop: 8 }} />}<div style={{ textAlign: 'right', marginTop: 8 }}><Button size="sm" disabled={reason.trim().length < 10 || negotiate.isPending || dispute.isPending} onClick={() => mode === 'negotiation' ? negotiate.mutate() : dispute.mutate()}>{mode === 'negotiation' ? 'Send proposal' : 'Open dispute'}</Button></div></div>}</div>;
};
