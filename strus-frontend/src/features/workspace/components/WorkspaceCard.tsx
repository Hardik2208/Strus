import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { WorkspaceSummary } from '../types/workspace.types';
import { ArrowRight } from 'lucide-react';

export const WorkspaceCard: React.FC<{ workspace: WorkspaceSummary }> = ({ workspace }) => {
  const navigate = useNavigate();
  const isPersonal = workspace.workspaceType === 'PERSONAL';

  return (
    <div 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-24)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        cursor: 'pointer'
      }}
      onClick={() => navigate(`/workspaces/${workspace.id}`)}
      onMouseOver={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.04)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{ marginBottom: 'var(--space-24)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {workspace.name}
        </h3>
        {isPersonal && (
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Your private workspace
          </p>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-12)', marginBottom: 'var(--space-32)' }}>
        <span style={{ 
          fontSize: '11px', 
          fontWeight: 600, 
          letterSpacing: '0.05em', 
          padding: '4px 10px', 
          borderRadius: '4px', 
          backgroundColor: isPersonal ? 'var(--color-surface-subtle)' : 'var(--color-surface-subtle)',
          color: 'var(--color-text-secondary)',
          border: '1px solid var(--color-border)'
        }}>
          {workspace.workspaceType}
        </span>
        
        <span style={{ 
          fontSize: '11px', 
          fontWeight: 600, 
          letterSpacing: '0.05em', 
          padding: '4px 10px', 
          borderRadius: '4px', 
          backgroundColor: 'transparent',
          color: 'var(--color-text-muted)',
          border: '1px solid transparent'
        }}>
          {workspace.role}
        </span>
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', color: 'var(--color-primary)', fontSize: '14px', fontWeight: 500 }}>
        Open Workspace <ArrowRight size={16} style={{ marginLeft: '6px' }} />
      </div>
    </div>
  );
};
