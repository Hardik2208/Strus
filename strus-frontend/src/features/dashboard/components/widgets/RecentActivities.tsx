import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Activity, FileText, CheckCircle, AlertCircle, Clock, Bell } from 'lucide-react';
import type { AppEvent } from '../../../events/types/event.types';
import { EVENT_TYPES } from '../../../events/types/event.types';

interface RecentActivitiesProps {
  activities: AppEvent[];
}

export const RecentActivitiesWidget: React.FC<RecentActivitiesProps> = ({ activities }) => {
  const navigate = useNavigate();

  if (!activities || activities.length === 0) {
    return (
      <div style={{
        backgroundColor: 'var(--color-surface-base)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        padding: 'var(--space-24)',
        textAlign: 'center',
        color: 'var(--color-text-secondary)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-12)' }}>
          <Activity size={32} style={{ color: 'var(--color-border)' }} />
        </div>
        <h4 style={{ fontSize: 'var(--text-md)', fontWeight: 500, color: 'var(--color-text-primary)' }}>No recent activity</h4>
        <p style={{ fontSize: 'var(--text-sm)', marginTop: 'var(--space-4)' }}>When things happen in your projects, they will appear here.</p>
      </div>
    );
  }

  const getIconForEventType = (type: string) => {
    switch (type) {
      case EVENT_TYPES.EXECUTION_PLAN_CREATED:
      case EVENT_TYPES.EXECUTION_PLAN_UPDATED:
        return <FileText size={20} style={{ color: 'var(--color-primary)' }} />;
      case EVENT_TYPES.SUBMISSION_CREATED:
      case EVENT_TYPES.PROJECT_ASSET_SHARED:
        return <AlertCircle size={20} style={{ color: 'var(--color-warning)' }} />;
      case EVENT_TYPES.SUBMISSION_APPROVED:
      case EVENT_TYPES.MILESTONE_COMPLETED:
      case EVENT_TYPES.PROJECT_COMPLETED:
        return <CheckCircle size={20} style={{ color: 'var(--color-success)' }} />;
      case EVENT_TYPES.REVISION_REQUESTED:
      case EVENT_TYPES.EXTENSION_REQUEST_CREATED:
        return <Clock size={20} style={{ color: 'var(--color-danger)' }} />;
      default:
        return <Bell size={20} style={{ color: 'var(--color-text-secondary)' }} />;
    }
  };

  const handleAction = (activity: AppEvent) => {
    // If the activity has an actionable resource, we could navigate.
    // For now we'll just log or navigate to a general activities page if needed.
    if (activity.resourceType === 'PROJECT' && activity.resourceId) {
      navigate(`/projects/${activity.resourceId}`);
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--color-surface-base)',
      border: '1px solid var(--color-border)',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {activities.map((activity, index) => (
          <div 
            key={activity.id} 
            onClick={() => handleAction(activity)}
            style={{
              display: 'flex',
              gap: 'var(--space-16)',
              padding: 'var(--space-16)',
              borderBottom: index < activities.length - 1 ? '1px solid var(--color-border)' : 'none',
              cursor: activity.resourceId ? 'pointer' : 'default',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => activity.resourceId && (e.currentTarget.style.backgroundColor = 'var(--color-surface-subtle)')}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-surface-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {getIconForEventType(activity.type)}
            </div>
            
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-8)' }}>
                <h4 style={{ 
                  fontSize: 'var(--text-sm)', 
                  fontWeight: 600, 
                  color: 'var(--color-text-primary)',
                  margin: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {activity.title}
                </h4>
                <span style={{ 
                  fontSize: 'var(--text-xs)', 
                  color: 'var(--color-text-tertiary)',
                  whiteSpace: 'nowrap'
                }}>
                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p style={{ 
                fontSize: 'var(--text-sm)', 
                color: 'var(--color-text-secondary)',
                margin: 'var(--space-4) 0 0 0',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {activity.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
