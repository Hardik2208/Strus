import React, { useState } from 'react';
import { useAgreementParticipants } from '../hooks/useAgreementQueries';
import { ParticipantCard } from './ParticipantCard';
import { InviteProfessionalModal } from './InviteProfessionalModal';
import { Button } from '../../../components/ui/Button';
import { Users, Plus } from 'lucide-react';

interface ParticipantsSectionProps {
  projectId: string;
  setupStage?: string;
  isCreator: boolean;
  isEditable: boolean;
}

export const ParticipantsSection: React.FC<ParticipantsSectionProps> = ({ projectId, setupStage, isCreator, isEditable }) => {
  const { data: participantsData, isLoading } = useAgreementParticipants(projectId, setupStage);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  if (isLoading && setupStage !== 'PROJECT_CREATED') {
    return (
      <div style={{ height: '150px', backgroundColor: 'var(--color-surface-subtle)', borderRadius: '8px', animation: 'pulse 1.5s infinite ease-in-out' }} />
    );
  }

  const participants = participantsData?.participants || [];
  
  const contractors = participants.filter(p => p.role === 'CONTRACTOR');
  const professionals = participants.filter(p => p.role === 'PROFESSIONAL');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-16)' }}>
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
          <Users size={20} /> Participants
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-32)' }}>
        {/* Contractor Section */}
        <div>
          <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 'var(--space-12)' }}>Contractor</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
            {contractors.length > 0 ? (
              contractors.map(contractor => (
                <ParticipantCard 
                  key={contractor.id} 
                  projectId={projectId}
                  participant={contractor} 
                  isCreator={isCreator}
                />
              ))
            ) : (
              <div style={{ padding: 'var(--space-16)', backgroundColor: 'var(--color-surface-subtle)', borderRadius: '8px', color: 'var(--color-text-tertiary)', fontSize: 'var(--text-sm)' }}>
                Contractor information not found.
              </div>
            )}
          </div>
        </div>

        {/* Professionals Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-12)' }}>
            <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Professionals</h3>
            {isCreator && isEditable && (
              <Button size="sm" variant="outline" onClick={() => setIsInviteModalOpen(true)}>
                <Plus size={14} style={{ marginRight: '6px' }} /> Add Professional
              </Button>
            )}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
            {professionals.length > 0 ? (
              professionals.map(professional => (
                <ParticipantCard 
                  key={professional.id} 
                  projectId={projectId}
                  participant={professional} 
                  isCreator={isCreator}
                />
              ))
            ) : (
              <div style={{ 
                padding: 'var(--space-24)', 
                backgroundColor: 'var(--color-surface-subtle)', 
                borderRadius: '8px', 
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--space-12)'
              }}>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                  No professionals invited yet.
                </div>
                {isCreator && isEditable && (
                  <Button size="sm" onClick={() => setIsInviteModalOpen(true)}>
                    Add Professional
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {isInviteModalOpen && (
        <InviteProfessionalModal 
          projectId={projectId} 
          isOpen={isInviteModalOpen} 
          onClose={() => setIsInviteModalOpen(false)} 
        />
      )}
    </div>
  );
};
