import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAgreement } from '../hooks/useAgreementQueries';
import { useAgreementRealtime } from '../hooks/useAgreementRealtime';
import { useProjectDetail } from '../../project/hooks/useProjectQueries';
import { useAuthStore } from '../../auth/store/auth.store';
import { AgreementForm } from '../components/AgreementForm';
import { ParticipantsSection } from '../components/ParticipantsSection';
import { AgreementAuditTimeline } from '../components/AgreementAuditTimeline';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { format, parseISO } from 'date-fns';
import { FileText, Edit2, Lock } from 'lucide-react';

export const AgreementPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuthStore();
  
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: project, isLoading: isProjectLoading } = useProjectDetail(projectId!);
  const { data: agreement, isLoading: isAgreementLoading } = useAgreement(projectId!, project?.setupStage);
  
  // Connect to realtime updates
  useAgreementRealtime(projectId!);

  if (isProjectLoading || (isAgreementLoading && project?.setupStage !== 'PROJECT_CREATED')) {
    return (
      <div style={{ height: '200px', backgroundColor: 'var(--color-surface-subtle)', borderRadius: '8px', animation: 'pulse 1.5s infinite ease-in-out' }} />
    );
  }

  if (!project) return null;

  const isCreator = user?.id === project.createdById;
  const isEditable = project.status === 'DRAFT';

  // Agreement not created state
  if (!agreement) {
    return (
      <div style={{ padding: 'var(--space-32)', textAlign: 'center', backgroundColor: 'var(--color-surface-subtle)', borderRadius: '8px' }}>
        <FileText size={48} style={{ color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-16)' }} />
        <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, marginBottom: 'var(--space-8)' }}>Agreement not created</h3>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-24)', maxWidth: '400px', margin: '0 auto var(--space-24) auto' }}>
          Define the terms of this project before inviting professionals.
        </p>
        {isCreator ? (
          <>
            <Button onClick={() => setIsFormOpen(true)}>Create Agreement</Button>
            <AgreementForm 
              projectId={projectId!} 
              isOpen={isFormOpen} 
              onClose={() => setIsFormOpen(false)} 
            />
          </>
        ) : (
          <p style={{ color: 'var(--color-text-tertiary)' }}>Only the project creator can initialize the agreement.</p>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-32)' }}>
      {/* Agreement Details Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-16)' }}>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
            <FileText size={20} /> Agreement Details
          </h2>
          
          {isCreator && (
            isEditable ? (
              <Button variant="outline" onClick={() => setIsFormOpen(true)}>
                <Edit2 size={16} style={{ marginRight: '8px' }} /> Edit Agreement
              </Button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', color: 'var(--color-text-tertiary)', fontSize: 'var(--text-sm)' }}>
                <Lock size={14} /> This agreement is currently locked.
              </div>
            )
          )}
        </div>

        <Card style={{ padding: 'var(--space-24)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-16)' }}>
            {agreement.title}
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-24)', marginBottom: 'var(--space-24)', paddingBottom: 'var(--space-24)', borderBottom: '1px solid var(--color-border)' }}>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-4)' }}>Budget</div>
              <div style={{ fontSize: 'var(--text-md)', fontWeight: 500 }}>
                {agreement.budget
  ? `₹${Number(agreement.budget).toLocaleString('en-IN')}`
  : 'Not specified'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-4)' }}>Expected Duration</div>
              <div style={{ fontSize: 'var(--text-md)', fontWeight: 500 }}>
                {agreement.expectedDuration ? `${agreement.expectedDuration} Days` : 'Not specified'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-4)' }}>Last Updated</div>
              <div style={{ fontSize: 'var(--text-md)', fontWeight: 500 }}>
                {format(parseISO(agreement.updatedAt), 'MMM d, yyyy h:mm a')}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)' }}>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-8)' }}>Description</div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {agreement.description || 'No description provided.'}
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-8)' }}>Scope</div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {agreement.scope || 'No scope details provided.'}
              </div>
            </div>

            {agreement.outOfScope && (
              <div>
                <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-8)' }}>Out of Scope</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {agreement.outOfScope}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      <ParticipantsSection projectId={projectId!} setupStage={project.setupStage} isCreator={isCreator} isEditable={isEditable} />
      
      <AgreementAuditTimeline projectId={projectId!} setupStage={project.setupStage} />

      {isFormOpen && (
        <AgreementForm 
          projectId={projectId!} 
          agreement={agreement}
          isOpen={isFormOpen} 
          onClose={() => setIsFormOpen(false)} 
        />
      )}
    </div>
  );
};
