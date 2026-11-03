import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { dashboardService } from '../services/dashboard.service';
import { RecentActivitiesWidget } from '../components/widgets/RecentActivities';
import { ListSkeleton } from '../components/widgets/Skeletons';

export const ActivitiesPage: React.FC = () => {
  const location = useLocation();
  const isProfessional = location.pathname.includes('/professional');

  const { data: activitiesData, isLoading } = useQuery({
    queryKey: [isProfessional ? 'professionalActivities' : 'clientActivities'],
    queryFn: () => isProfessional 
      ? dashboardService.getProfessionalActivities(20).then(res => res.data)
      : dashboardService.getClientActivities(20).then(res => res.data)
  });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--space-24) 0', display: 'flex', flexDirection: 'column', gap: 'var(--space-32)' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--color-text-primary)' }}>Recent Activities</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-8)' }}>
          {isProfessional ? "Activities across your professional engagements." : "Activities across your client projects."}
        </p>
      </div>

      <section>
        {isLoading ? (
          <ListSkeleton count={10} />
        ) : (
          <RecentActivitiesWidget activities={activitiesData?.data || []} />
        )}
      </section>
    </div>
  );
};
