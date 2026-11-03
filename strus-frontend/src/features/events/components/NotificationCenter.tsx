import React, { useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventList, useMarkAllEventsRead, useMarkEventRead } from '../hooks/useEvents';
import { EventRow } from './EventRow';
import { getEventDestination } from '../utils/eventNavigation';
import type { AppEvent, EventListResponse } from '../types/event.types';
import { Loader2, Check } from 'lucide-react';

interface NotificationCenterProps {
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading,
    isError
  } = useEventList(20);
  
  const { mutate: markAsRead } = useMarkEventRead();
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllEventsRead();

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading || isFetchingNextPage) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]);

  const handleEventClick = (event: AppEvent) => {
    if (event.readAt === null) {
      markAsRead(event.id);
    }
    
    const destination = getEventDestination(event);
    if (destination) {
      navigate(destination);
      onClose();
    }
    // If no destination, it's just informational. Just mark read and leave open (or close depending on preference).
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  const events = data?.pages.flatMap((page: EventListResponse) => page.data) || [];
  const hasEvents = events.length > 0;

  return (
    <div style={{
      position: 'absolute',
      top: '100%',
      right: 0,
      marginTop: 'var(--space-8)',
      width: '380px',
      maxHeight: '480px',
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-lg)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
      overflow: 'hidden'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: 'var(--space-16)',
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: 'var(--color-text-primary)' }}>
          Notifications
        </h3>
        {hasEvents && (
          <button
            onClick={handleMarkAllRead}
            disabled={isMarkingAll}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--color-primary)',
              cursor: isMarkingAll ? 'not-allowed' : 'pointer',
              opacity: isMarkingAll ? 0.6 : 1,
            }}
          >
            <Check size={14} /> Mark all read
          </button>
        )}
      </div>

      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: 'var(--color-background)' 
      }}>
        {isLoading ? (
          <div style={{ padding: 'var(--space-32)', display: 'flex', justifyContent: 'center' }}>
            <Loader2 size={24} className="animate-spin" color="var(--color-text-secondary)" />
          </div>
        ) : isError ? (
          <div style={{ padding: 'var(--space-32)', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            Unable to load notifications.
          </div>
        ) : !hasEvents ? (
          <div style={{ padding: 'var(--space-48) var(--space-24)', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            You're all caught up.
          </div>
        ) : (
          <>
            {events.map((event, index) => {
              if (index === events.length - 1) {
                return (
                  <div ref={lastElementRef} key={event.id}>
                    <EventRow event={event} onClick={handleEventClick} />
                  </div>
                );
              }
              return <EventRow key={event.id} event={event} onClick={handleEventClick} />;
            })}
            
            {isFetchingNextPage && (
              <div style={{ padding: 'var(--space-16)', display: 'flex', justifyContent: 'center' }}>
                <Loader2 size={16} className="animate-spin" color="var(--color-text-muted)" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
