import React from 'react';
import { Card } from '../../../../components/ui/Card';

export interface OverviewMetric {
  label: string;
  value: number;
}

export const OverviewCards: React.FC<{ metrics: OverviewMetric[] }> = ({ metrics }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-16)' }}>
    {metrics.map((m, i) => (
      <Card key={i} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', flex: 1, minWidth: '140px' }}>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>{m.label}</span>
        <span style={{ fontSize: 'var(--text-2xl)', fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
          {m.value}
        </span>
      </Card>
    ))}
  </div>
);
