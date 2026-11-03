import React, { useState } from 'react';
import { useAgreementAudits } from '../hooks/useAgreementQueries';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { format, parseISO } from 'date-fns';
import { History, Filter } from 'lucide-react';

interface AgreementAuditTimelineProps {
  projectId: string;
  setupStage?: string;
}

export const AgreementAuditTimeline: React.FC<AgreementAuditTimelineProps> = ({ projectId, setupStage }) => {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('All');
  
  const limit = 10;
  
  const { data, isLoading } = useAgreementAudits(projectId, setupStage, page, limit, actionFilter);

  const filters = ['All', 'CREATED', 'UPDATED', 'INVITED', 'ACCEPTED', 'DECLINED', 'WITHDRAWN', 'REMOVED'];

  const logs = data?.logs || [];
  const pagination = data?.pagination;

  return (
    <Card style={{ padding: 'var(--space-24)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-24)' }}>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
          <History size={18} /> Activity
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
          <Filter size={14} style={{ color: 'var(--color-text-tertiary)' }} />
          <select 
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            style={{ 
              padding: 'var(--space-4) var(--space-8)', 
              borderRadius: '6px', 
              border: '1px solid var(--color-border)',
              fontSize: 'var(--text-sm)',
              backgroundColor: 'var(--color-surface)',
              cursor: 'pointer'
            }}
          >
            {filters.map(f => (
              <option key={f} value={f}>{f === 'All' ? 'All Activity' : f}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading && setupStage !== 'PROJECT_CREATED' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ display: 'flex', gap: 'var(--space-16)' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-surface-subtle)', flexShrink: 0, animation: 'pulse 1.5s infinite' }} />
              <div style={{ flex: 1, height: '24px', backgroundColor: 'var(--color-surface-subtle)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
            </div>
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-24)', color: 'var(--color-text-secondary)' }}>
          No activity found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)' }}>
          {logs.map((log, index) => (
            <div key={log.id} style={{ display: 'flex', gap: 'var(--space-16)', position: 'relative' }}>
              {index !== logs.length - 1 && (
                <div style={{ position: 'absolute', left: '16px', top: '32px', bottom: '-24px', width: '2px', backgroundColor: 'var(--color-border)' }} />
              )}
              
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: 'var(--text-sm)',
                overflow: 'hidden',
                flexShrink: 0,
                zIndex: 1
              }}>
                {log.actor.avatarUrl ? (
                  <img src={log.actor.avatarUrl} alt={log.actor.firstName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  log.actor.firstName[0].toUpperCase()
                )}
              </div>
              
              <div style={{ flex: 1, paddingBottom: 'var(--space-8)' }}>
                <div style={{ fontSize: 'var(--text-sm)' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {log.actor.firstName} {log.actor.lastName}
                  </span>
                  {' '}
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    {getLogActionText(log.action)}
                  </span>
                </div>
                
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginTop: 'var(--space-4)' }}>
                  {format(parseISO(log.createdAt), 'MMM d, yyyy h:mm a')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-8)', marginTop: 'var(--space-32)' }}>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <span style={{ fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', padding: '0 var(--space-8)' }}>
            Page {page} of {pagination.totalPages}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={!pagination.hasNext}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </Card>
  );
};

function getLogActionText(action: string): string {
  switch (action) {
    case 'CREATED': return 'created the agreement';
    case 'UPDATED': return 'updated the agreement details';
    case 'INVITED': return 'invited a professional';
    case 'ACCEPTED': return 'accepted the invitation';
    case 'DECLINED': return 'declined the invitation';
    case 'WITHDRAWN': return 'withdrew the invitation';
    case 'REMOVED': return 'removed the professional';
    default: return `performed action: ${action}`;
  }
}
