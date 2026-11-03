import React, { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, FileUp, FolderOpen, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { useAgreementParticipants } from '../../agreement/hooks/useAgreementQueries';
import { executionService } from '../api/execution.service';

export const ProjectAssetsPanel: React.FC<{ projectId: string; isCreator: boolean }> = ({ projectId, isCreator }) => {
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const participants = useAgreementParticipants(projectId, 'PROFESSIONALS_ASSIGNED');
  const assets = useQuery({ queryKey: ['execution', projectId, 'assets'], queryFn: async () => (await executionService.getAssets(projectId)).data });
  const audits = useQuery({ queryKey: ['execution', projectId, 'audits'], queryFn: async () => (await executionService.getAudits(projectId)).data });
  const upload = useMutation({ mutationFn: () => executionService.createAsset(projectId, files, (participants.data?.participants ?? []).filter((p) => p.role === 'PROFESSIONAL' && p.invitationStatus === 'ACCEPTED').map((p) => p.id)), onSuccess: () => { setFiles([]); queryClient.invalidateQueries({ queryKey: ['execution', projectId, 'assets'] }); toast.success('Project asset shared.'); } });
  const remove = useMutation({ mutationFn: (assetId: string) => executionService.deleteAsset(projectId, assetId), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['execution', projectId, 'assets'] }) });

  return <Card style={{ padding: 'var(--space-20)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'start', marginBottom: 16 }}><div><h3 style={{ margin: 0 }}>Project assets</h3><p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 4 }}>Files shared with the professionals assigned to this project.</p></div>{isCreator && <Button size="sm" variant="outline" onClick={() => fileInput.current?.click()}><FileUp size={15} /> Add files</Button>}</div>
    <input hidden ref={fileInput} type="file" multiple onChange={(event) => setFiles((current) => [...current, ...Array.from(event.target.files ?? [])])} />
    {files.length > 0 && <div style={{ background: 'var(--color-surface-subtle)', padding: 12, borderRadius: 'var(--radius-md)', marginBottom: 16 }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', fontWeight: 600 }}><span>{files.length} file{files.length === 1 ? '' : 's'} ready to share</span><Button size="sm" onClick={() => upload.mutate()} disabled={upload.isPending}>{upload.isPending ? 'Uploading…' : 'Share with professionals'}</Button></div><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>{files.map((file, index) => <span key={`${file.name}-${index}`} style={{ fontSize: 'var(--text-xs)' }}>{file.name} <button onClick={() => setFiles((all) => all.filter((_, i) => i !== index))}><X size={12} /></button></span>)}</div></div>}
    {assets.isLoading ? <p style={{ color: 'var(--color-text-secondary)' }}>Loading assets…</p> : assets.data?.length ? <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{assets.data.map((asset) => <div key={asset.id} style={{ border: '1px solid var(--color-border)', padding: 12, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}><div><div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{asset.files.length} file{asset.files.length === 1 ? '' : 's'}</div><div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>{asset.files.map((file) => <a key={file.id} href={file.url} target="_blank" rel="noreferrer" style={{ fontSize: 'var(--text-xs)', display: 'inline-flex', gap: 4 }}><Download size={12} /> {file.originalName}</a>)}</div></div>{isCreator && <Button size="sm" variant="ghost" onClick={() => { if (window.confirm('Delete this asset?')) remove.mutate(asset.id); }}><Trash2 size={15} /></Button>}</div>)}</div> : <div style={{ textAlign: 'center', padding: 24, color: 'var(--color-text-secondary)' }}><FolderOpen size={28} style={{ marginBottom: 8 }} /><div>No project assets have been shared yet.</div></div>}
    <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}><div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 8 }}>Execution activity</div>{audits.isLoading ? <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Loading activity…</span> : audits.data?.length ? <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{audits.data.slice(0, 8).map((audit) => <div key={audit.id} style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{audit.action.replaceAll('_', ' ').toLowerCase()} <span style={{ color: 'var(--color-text-muted)' }}>· {new Date(audit.createdAt).toLocaleString()}</span></div>)}</div> : <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>No execution activity yet.</span>}</div>
  </Card>;
};
