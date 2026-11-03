import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWorkspacesList } from '../../features/workspace/hooks/useWorkspace';
import type { WorkspaceSummary } from '../../features/workspace/types/workspace.types';
import { Building2, ChevronDown, Plus } from 'lucide-react';

export const WorkspaceSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { data, isLoading } = useWorkspacesList(1, 50);
  const workspaces: WorkspaceSummary[] = data?.workspaces || [];
  
  const personalWorkspaces = workspaces.filter(w => w.workspaceType === 'PERSONAL');
  const teamWorkspaces = workspaces.filter(w => w.workspaceType === 'TEAM');

  // Determine active workspace if we are inside a workspace route
  const currentPath = location.pathname;
  const activeWorkspaceMatch = currentPath.match(/\/workspaces\/([a-zA-Z0-9-]+)/);
  const activeWorkspaceId = activeWorkspaceMatch ? activeWorkspaceMatch[1] : null;
  const activeWorkspace = activeWorkspaceId ? workspaces.find(w => w.id === activeWorkspaceId) : null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} style={{ position: 'relative', width: '100%', padding: '0 var(--space-16)', marginBottom: 'var(--space-16)' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          backgroundColor: isOpen ? 'var(--color-surface-hover)' : 'transparent',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          color: 'var(--color-text-primary)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
          <div style={{ 
            width: '24px', height: '24px', borderRadius: '4px', 
            backgroundColor: 'var(--color-primary)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <Building2 size={14} />
          </div>
          <span style={{ fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {activeWorkspace ? activeWorkspace.name : 'Select Workspace'}
          </span>
        </div>
        <ChevronDown size={16} color="var(--color-text-secondary)" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 'var(--space-16)',
          right: 'var(--space-16)',
          marginTop: '4px',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-md)',
          zIndex: 100,
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          {isLoading ? (
            <div style={{ padding: '12px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
              Loading workspaces...
            </div>
          ) : (
            <>
              {personalWorkspaces.length > 0 && (
                <div style={{ padding: '8px 0' }}>
                  <div style={{ padding: '0 12px', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', letterSpacing: '0.05em', marginBottom: '4px' }}>PERSONAL</div>
                  {personalWorkspaces.map(ws => (
                    <button
                      key={ws.id}
                      onClick={() => { navigate(`/workspaces/${ws.id}`); setIsOpen(false); }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', padding: '6px 12px',
                        background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                        backgroundColor: ws.id === activeWorkspaceId ? 'var(--color-surface-hover)' : 'transparent',
                        color: 'var(--color-text-primary)', fontSize: '13px'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = ws.id === activeWorkspaceId ? 'var(--color-surface-hover)' : 'transparent'}
                    >
                      {ws.name}
                    </button>
                  ))}
                </div>
              )}
              
              {personalWorkspaces.length > 0 && teamWorkspaces.length > 0 && (
                <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '4px 0' }} />
              )}

              {teamWorkspaces.length > 0 && (
                <div style={{ padding: '8px 0' }}>
                  <div style={{ padding: '0 12px', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', letterSpacing: '0.05em', marginBottom: '4px' }}>TEAM WORKSPACES</div>
                  {teamWorkspaces.map(ws => (
                    <button
                      key={ws.id}
                      onClick={() => { navigate(`/workspaces/${ws.id}`); setIsOpen(false); }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', padding: '6px 12px',
                        background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                        backgroundColor: ws.id === activeWorkspaceId ? 'var(--color-surface-hover)' : 'transparent',
                        color: 'var(--color-text-primary)', fontSize: '13px'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = ws.id === activeWorkspaceId ? 'var(--color-surface-hover)' : 'transparent'}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <span>{ws.name}</span>
                        <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>{ws.role}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '4px 0' }} />
              <button
                onClick={() => { navigate('/workspaces'); setIsOpen(false); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
                  background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                  color: 'var(--color-primary)', fontSize: '13px', fontWeight: 500
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Plus size={14} /> View All Workspaces
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
