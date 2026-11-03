import React, { useState } from 'react';
import { useAgreementParticipants } from '../../agreement/hooks/useAgreementQueries';
import { type Milestone, type MilestoneStatus } from '../types/execution.types';
import {
  CheckCircle2,
  Clock,
  PlayCircle,
  Send,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Target,
  Package,
  ListChecks,
  Calendar,
  DollarSign,
  RefreshCw,
} from 'lucide-react';
import { MilestoneDeliveryPanel } from './MilestoneDeliveryPanel';

interface ExecutionPlanViewerProps {
  projectId: string;
  milestones: Milestone[];
  isCreator: boolean;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

const STATUS_CONFIG: Record<
  MilestoneStatus,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  NOT_STARTED: {
    label: 'Not Started',
    color: 'var(--color-text-secondary)',
    bg: 'var(--color-surface-subtle)',
    icon: Clock,
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: 'var(--color-primary)',
    bg: 'var(--color-primary-soft)',
    icon: PlayCircle,
  },
  SUBMITTED: {
    label: 'Submitted',
    color: 'var(--color-info)',
    bg: 'var(--color-info-light)',
    icon: Send,
  },
  REVISION_REQUESTED: {
    label: 'Revision Requested',
    color: 'var(--color-warning)',
    bg: 'var(--color-warning-light)',
    icon: RefreshCw,
  },
  REVISION_LIMIT_REACHED: {
    label: 'Revision Limit Reached',
    color: 'var(--color-error)',
    bg: 'var(--color-error-light)',
    icon: AlertTriangle,
  },
  NEGOTIATION: {
    label: 'Negotiation',
    color: 'var(--color-warning)',
    bg: 'var(--color-warning-light)',
    icon: AlertTriangle,
  },
  UNDER_DISPUTE: {
    label: 'Under Dispute',
    color: 'var(--color-error)',
    bg: 'var(--color-error-light)',
    icon: AlertTriangle,
  },
  COMPLETED: {
    label: 'Completed',
    color: 'var(--color-success)',
    bg: 'var(--color-success-light)',
    icon: CheckCircle2,
  },
};

const MilestoneCard: React.FC<{ milestone: Milestone; index: number; isCreator: boolean }> = ({
  milestone,
  index,
  isCreator,
}) => {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[milestone.status];
  const StatusIcon = cfg.icon;

  const hasSpecificationDetails =
    (milestone.requirements && milestone.requirements.length > 0) ||
    (milestone.deliverables && milestone.deliverables.length > 0) ||
    (milestone.acceptanceCriteria && milestone.acceptanceCriteria.length > 0);
  // Delivery, review, extensions, and resolution actions live in the expanded
  // area too, so every milestone must remain expandable even without a checklist.
  const hasDetails = true;

  return (
    <div
      style={{
        border: '1px solid var(--color-border)',
        borderRadius: '10px',
        overflow: 'hidden',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          cursor: hasDetails ? 'pointer' : 'default',
        }}
        onClick={() => hasDetails && setExpanded((p) => !p)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {index + 1}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text-primary)' }}>
              Milestone {index + 1}
            </div>
            <div
              style={{
                display: 'flex',
                gap: '16px',
                marginTop: '4px',
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <Calendar size={12} /> {milestone.allocatedDays}d
              </span>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <DollarSign size={12} /> ₹{Number(milestone.paymentAllocation).toLocaleString()}
              </span>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <RefreshCw size={12} /> {milestone.revisionLimit} revisions
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: '20px',
              backgroundColor: cfg.bg,
              color: cfg.color,
              fontSize: '11px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            <StatusIcon size={12} />
            {cfg.label}
          </span>
          {hasDetails &&
            (expanded ? (
              <ChevronUp size={16} color="var(--color-text-tertiary)" />
            ) : (
              <ChevronDown size={16} color="var(--color-text-tertiary)" />
            ))}
        </div>
      </div>

      {/* Expandable details */}
      {expanded && (
        <div
          style={{
            borderTop: '1px solid var(--color-border)',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            backgroundColor: 'var(--color-surface-subtle)',
          }}
        >
          {hasSpecificationDetails && milestone.requirements && milestone.requirements.length > 0 && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--color-text-tertiary)',
                  marginBottom: '8px',
                }}
              >
                <Target size={12} /> Requirements
              </div>
              <ul style={{ margin: 0, padding: '0 0 0 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {milestone.requirements.map((r) => (
                  <li key={r.id} style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                    {r.content}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {hasSpecificationDetails && milestone.deliverables && milestone.deliverables.length > 0 && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--color-text-tertiary)',
                  marginBottom: '8px',
                }}
              >
                <Package size={12} /> Deliverables
              </div>
              <ul style={{ margin: 0, padding: '0 0 0 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {milestone.deliverables.map((d) => (
                  <li key={d.id} style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                    {d.content}
                    {!d.isMandatory && (
                      <span style={{ marginLeft: '6px', fontSize: '10px', color: 'var(--color-text-tertiary)', backgroundColor: 'var(--color-border)', padding: '1px 6px', borderRadius: '4px' }}>
                        optional
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {hasSpecificationDetails && milestone.acceptanceCriteria && milestone.acceptanceCriteria.length > 0 && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--color-text-tertiary)',
                  marginBottom: '8px',
                }}
              >
                <ListChecks size={12} /> Acceptance Criteria
              </div>
              <ul style={{ margin: 0, padding: '0 0 0 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {milestone.acceptanceCriteria.map((a) => (
                  <li key={a.id} style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                    {a.content}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <MilestoneDeliveryPanel milestone={milestone} isCreator={isCreator} />
        </div>
      )}
    </div>
  );
};

export const ExecutionPlanViewer: React.FC<ExecutionPlanViewerProps> = ({
  projectId,
  milestones,
  isCreator,
  onEdit,
  onDelete,
  isDeleting,
}) => {
  const { data: participantsData } = useAgreementParticipants(projectId, 'PROFESSIONALS_ASSIGNED');
  const participants = participantsData?.participants ?? [];

  // Group milestones by agreementParticipantId
  const byParticipant = milestones.reduce<Record<string, Milestone[]>>((acc, m) => {
    if (!acc[m.agreementParticipantId]) acc[m.agreementParticipantId] = [];
    acc[m.agreementParticipantId].push(m);
    return acc;
  }, {});

  const completedCount = milestones.filter((m) => m.status === 'COMPLETED').length;
  const totalCount = milestones.length;

  const getProfessionalName = (participantId: string) => {
    const p = participants.find((x) => x.id === participantId);
    if (!p) return `Professional (${participantId.slice(0, 6)})`;
    const profile = p.profile ?? p.user?.profile;
    if (!profile) return 'Professional';
    return `${profile.firstName} ${profile.lastName} (@${profile.username})`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Summary bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '16px 20px',
          borderRadius: '10px',
          backgroundColor: 'var(--color-primary)',
          color: 'white',
        }}
      >
        <div>
          <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '2px' }}>
            Execution Plan
          </div>
          <div style={{ fontSize: '13px', opacity: 0.85 }}>
            {completedCount} / {totalCount} milestones completed
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {isCreator && (
            <>
              <button
                onClick={onEdit}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.4)',
                  background: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                  backdropFilter: 'blur(4px)',
                }}
              >
                Edit Plan
              </button>
              <button
                onClick={onDelete}
                disabled={isDeleting}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,100,100,0.5)',
                  background: 'rgba(220,38,38,0.25)',
                  color: 'white',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                  opacity: isDeleting ? 0.6 : 1,
                }}
              >
                {isDeleting ? 'Deleting…' : 'Delete Plan'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div
          style={{
            height: '6px',
            borderRadius: '3px',
            backgroundColor: 'var(--color-border)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${totalCount ? (completedCount / totalCount) * 100 : 0}%`,
              backgroundColor: 'var(--color-success)',
              borderRadius: '3px',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>

      {/* Per-professional sections */}
      {Object.entries(byParticipant).map(([participantId, pMilestones]) => (
        <div key={participantId}>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary)',
              }}
            />
            {getProfessionalName(participantId)}
            <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', fontWeight: 400 }}>
              ({pMilestones.length} milestone{pMilestones.length !== 1 ? 's' : ''})
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pMilestones
              .sort((a, b) => a.order - b.order)
              .map((m, i) => (
                <MilestoneCard key={m.id} milestone={m} index={i} isCreator={isCreator} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};
