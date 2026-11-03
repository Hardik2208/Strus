import React from 'react';
import { Card } from '../../../components/ui/Card';
import type { ProjectSetupStage } from '../types/project.types';
import { CheckCircle2, Circle } from 'lucide-react';

interface ProjectSetupProgressProps {
  currentStage: ProjectSetupStage;
}

const STAGES: { id: ProjectSetupStage; label: string }[] = [
  { id: 'PROJECT_CREATED', label: 'Project Created' },
  { id: 'AGREEMENT_COMPLETED', label: 'Agreement Completed' },
  { id: 'PROFESSIONALS_ASSIGNED', label: 'Professionals Added' },
  { id: 'MILESTONES_CREATED', label: 'Execution Plan Created' },
  { id: 'READY_TO_START', label: 'Ready to Start' }
];

export const ProjectSetupProgress: React.FC<ProjectSetupProgressProps> = ({ currentStage }) => {
  const currentIndex = STAGES.findIndex(s => s.id === currentStage);

  return (
    <Card style={{ padding: 'var(--space-24)' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--space-16)', marginTop: 0 }}>
        Project Setup
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
        {STAGES.map((stage, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          
          return (
            <div key={stage.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
              {isCompleted ? (
                <CheckCircle2 size={18} style={{ color: 'var(--color-primary)' }} />
              ) : (
                <Circle size={18} style={{ color: 'var(--color-text-tertiary)' }} />
              )}
              <span style={{ 
                fontSize: '14px',
                fontWeight: isCurrent ? 600 : 400,
                color: isCompleted ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)' 
              }}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
