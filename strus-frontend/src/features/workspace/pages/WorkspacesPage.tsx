import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkspaceCard } from '../components/WorkspaceCard';
import { CreateWorkspaceModal } from '../components/modals/CreateWorkspaceModal';
import { Button } from '../../../components/ui/Button';
import { useWorkspaceRealtime } from '../hooks/useWorkspaceRealtime';
import { useInfiniteWorkspacesList } from '../hooks/useWorkspace';

export const WorkspacesPage: React.FC = () => {
  const {
  data,
  isLoading,
  isError,
  refetch,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteWorkspacesList(10);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const navigate = useNavigate();

  // Initialize realtime sync for workspace list
  useWorkspaceRealtime();

  const allWorkspaces =
  data?.pages.flatMap(page => page.workspaces) ?? [];

const personalWorkspaces = allWorkspaces.filter(
  w => w.workspaceType === 'PERSONAL'
);

const teamWorkspaces = allWorkspaces.filter(
  w => w.workspaceType === 'TEAM'
);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-32)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-24)' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--color-text-primary)' }}>Workspaces</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-8)' }}>Your spaces for organizing and collaborating.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>+ Create Workspace</Button>
      </div>

      {isLoading && allWorkspaces.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-32)' }}>
          <section>
            <h2 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: 'var(--space-16)' }}>PERSONAL</h2>
            <div style={{ height: '180px', backgroundColor: 'var(--color-surface-subtle)', borderRadius: '8px', animation: 'pulse 1.5s infinite ease-in-out' }} />
          </section>
          <section>
            <h2 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: 'var(--space-16)' }}>TEAM WORKSPACES</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-24)' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ height: '180px', backgroundColor: 'var(--color-surface-subtle)', borderRadius: '8px', animation: 'pulse 1.5s infinite ease-in-out', animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          </section>
        </div>
      ) : isError ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-48)', backgroundColor: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--space-8)' }}>Unable to load your workspaces.</h3>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-24)' }}>There was a problem communicating with the server.</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      ) : (
        <>
          <section>
            <h2 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: 'var(--space-16)' }}>PERSONAL</h2>
            {personalWorkspaces.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr' }}>
                {personalWorkspaces.map(ws => (
                  <WorkspaceCard key={ws.id} workspace={ws} />
                ))}
              </div>
            ) : (
              <div style={{ padding: 'var(--space-24)', backgroundColor: 'var(--color-surface)', borderRadius: '8px', border: '1px dashed var(--color-border)', color: 'var(--color-text-secondary)' }}>
                No Personal Workspace found.
              </div>
            )}
          </section>

          <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: 'var(--space-8) 0' }} />

          <section>
            <h2 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: 'var(--space-16)' }}>TEAM WORKSPACES</h2>
            {teamWorkspaces.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-24)' }}>
                {teamWorkspaces.map(ws => (
                  <WorkspaceCard key={ws.id} workspace={ws} />
                ))}
              </div>
            ) : (
              <div style={{ padding: 'var(--space-48)', backgroundColor: 'var(--color-surface)', borderRadius: '8px', border: '1px dashed var(--color-border)', textAlign: 'center' }}>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-16)' }}>You haven't joined or created a Team Workspace yet.</p>
                <Button variant="outline" onClick={() => setIsCreateModalOpen(true)}>Create Team Workspace</Button>
              </div>
            )}
          </section>

          {hasNextPage && (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      marginTop: 'var(--space-24)',
    }}
  >
    <Button
      variant="outline"
      onClick={() => fetchNextPage()}
      disabled={isFetchingNextPage}
    >
      {isFetchingNextPage ? 'Loading...' : 'Load more'}
    </Button>
  </div>
)}
        </>
      )}

      <CreateWorkspaceModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(id) => navigate(`/workspaces/${id}`)}
      />
    </div>
  );
};
