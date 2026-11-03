import { Card } from '../../../../components/ui/Card';

export const MetricSkeleton = () => (
  <Card style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '100px', backgroundColor: 'var(--color-surface-subtle)' }}>
    <div style={{ width: '60%', height: '14px', backgroundColor: 'var(--color-border)', borderRadius: '4px' }} />
    <div style={{ width: '40%', height: '28px', backgroundColor: 'var(--color-border-strong)', borderRadius: '4px', marginTop: 'auto' }} />
  </Card>
);

export const ProjectCardSkeleton = () => (
  <Card style={{ height: '160px', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: 'var(--color-surface-subtle)' }}>
    <div style={{ width: '80%', height: '18px', backgroundColor: 'var(--color-border)', borderRadius: '4px' }} />
    <div style={{ width: '50%', height: '14px', backgroundColor: 'var(--color-border)', borderRadius: '4px' }} />
    <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-border-strong)', borderRadius: '4px', marginTop: 'auto' }} />
  </Card>
);

export const ListSkeleton = ({ count = 3 }: { count?: number }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i} style={{ height: '64px', display: 'flex', alignItems: 'center', backgroundColor: 'var(--color-surface-subtle)' }}>
        <div style={{ width: '70%', height: '14px', backgroundColor: 'var(--color-border)', borderRadius: '4px' }} />
      </Card>
    ))}
  </div>
);
