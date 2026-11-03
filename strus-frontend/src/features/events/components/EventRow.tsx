import React from 'react';
import { getEventPresentation } from '../utils/eventPresentation';
import type { AppEvent } from '../types/event.types';
import { formatDistanceToNow } from 'date-fns';

interface EventRowProps {
  event: AppEvent;
  onClick: (event: AppEvent) => void;
}

export const EventRow: React.FC<EventRowProps> = ({ event, onClick }) => {
  const presentation = getEventPresentation(event.type);
  const Icon = presentation.icon;
  const isUnread = event.readAt === null;

  return (
    <div 
      onClick={() => onClick(event)}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--space-12)',
        padding: 'var(--space-12) var(--space-16)',
        cursor: 'pointer',
        backgroundColor: isUnread ? 'var(--color-surface-hover)' : 'transparent',
        borderBottom: '1px solid var(--color-border)',
        transition: 'background-color 0.2s ease',
      }}
      onMouseOver={(e) => {
        if (!isUnread) e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
      }}
      onMouseOut={(e) => {
        if (!isUnread) e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: presentation.bgColor,
        color: presentation.color,
        flexShrink: 0,
      }}>
        <Icon size={16} />
      </div>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ 
          fontSize: '13px', 
          fontWeight: isUnread ? 600 : 500, 
          color: 'var(--color-text-primary)' 
        }}>
          {event.title}
        </span>
        <span style={{ 
          fontSize: '13px', 
          color: 'var(--color-text-secondary)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {event.message}
        </span>
        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
          {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
        </span>
      </div>

      {isUnread && (
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-primary)',
          flexShrink: 0,
          marginTop: '6px' // align visually
        }} />
      )}
    </div>
  );
};
