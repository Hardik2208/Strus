import React from 'react';
import { Card } from '../../../../components/ui/Card';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action }) => (
  <Card style={{ textAlign: 'center', padding: 'var(--space-32)', backgroundColor: 'transparent', border: '1px dashed var(--color-border-strong)' }}>
    <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--space-8)' }}>{title}</h3>
    <p style={{ color: 'var(--color-text-secondary)', marginBottom: action ? 'var(--space-16)' : 0 }}>{description}</p>
    {action}
  </Card>
);
