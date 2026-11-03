import React from 'react';

export const UserIdentitySkeleton: React.FC = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-surface-hover)' }} className="pulse-skeleton" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ width: '120px', height: '14px', borderRadius: '4px', backgroundColor: 'var(--color-surface-hover)' }} className="pulse-skeleton" />
        <div style={{ width: '80px', height: '10px', borderRadius: '4px', backgroundColor: 'var(--color-surface-hover)' }} className="pulse-skeleton" />
      </div>
    </div>
  );
};

export const ProfileCardSkeleton: React.FC = () => {
  return (
    <div style={{ 
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-32)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 'var(--space-16)',
      width: '100%',
      maxWidth: '400px'
    }}>
      <div style={{ width: '96px', height: '96px', borderRadius: '50%', backgroundColor: 'var(--color-surface-hover)' }} className="pulse-skeleton" />
      <div style={{ width: '180px', height: '24px', borderRadius: '4px', backgroundColor: 'var(--color-surface-hover)' }} className="pulse-skeleton" />
      <div style={{ width: '120px', height: '16px', borderRadius: '4px', backgroundColor: 'var(--color-surface-hover)' }} className="pulse-skeleton" />
      <div style={{ width: '80%', height: '48px', borderRadius: '4px', backgroundColor: 'var(--color-surface-hover)' }} className="pulse-skeleton" />
    </div>
  );
};
