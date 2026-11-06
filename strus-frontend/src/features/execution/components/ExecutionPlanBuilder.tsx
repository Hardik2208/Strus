import React, { useState, useCallback, useEffect } from 'react';
import { useAgreement, useAgreementParticipants } from '../../agreement/hooks/useAgreementQueries';
import {
  type CreateExecutionPlanDto,
  type CreateMilestoneDto,
  type CreateMilestoneRequirementDto,
  type CreateMilestoneDeliverableDto,
  type CreateMilestoneAcceptanceCriteriaDto,
} from '../types/execution.types';
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Target,
  Package,
  ListChecks,
  Calendar,
  DollarSign,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const emptyMilestone = (): CreateMilestoneDto => ({
  allocatedDays: 1,
  paymentAllocation: 0,
  revisionLimit: 2,
  dependencies: [],
  requirements: [{ content: '' }],
  deliverables: [{ content: '', isMandatory: true }],
  acceptanceCriteria: [{ content: '' }],
});

type ProfessionalSection = {
  agreementParticipantId: string;
  milestones: CreateMilestoneDto[];
};

interface ExecutionPlanBuilderProps {
  projectId: string;
  onSubmit: (dto: CreateExecutionPlanDto) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  initialData?: CreateExecutionPlanDto;
}

const ListEditor = <T extends { content: string }>({
  label,
  icon: Icon,
  items,
  onChange,
  extraField,
}: {
  label: string;
  icon: React.ElementType;
  items: T[];
  onChange: (items: T[]) => void;
  extraField?: (item: T, idx: number, update: (patch: Partial<T>) => void) => React.ReactNode;
}) => {
  const update = (idx: number, patch: Partial<T>) => {
    const next = items.map((it, i) => (i === idx ? { ...it, ...patch } : it));
    onChange(next);
  };
  const add = () => onChange([...items, { content: '' } as T]);
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}
      >
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
          }}
        >
          <Icon size={12} />
          {label}
        </div>
        <button
          type="button"
          onClick={add}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            color: 'var(--color-primary)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px 6px',
            borderRadius: '4px',
          }}
        >
          <Plus size={12} /> Add
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {items.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <input
                type="text"
                value={item.content}
                onChange={(e) => update(idx, { content: e.target.value } as Partial<T>)}
                placeholder={`${label} ${idx + 1}`}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              {extraField && extraField(item, idx, (patch) => update(idx, patch as Partial<T>))}
            </div>
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => remove(idx)}
                style={{
                  marginTop: '6px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-tertiary)',
                  padding: '2px',
                  flexShrink: 0,
                }}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const MilestoneForm: React.FC<{
  milestone: CreateMilestoneDto;
  index: number;
  onChange: (updated: CreateMilestoneDto) => void;
  onRemove: () => void;
  canRemove: boolean;
  budget: number | null;
  allocatedSoFar: number;
}> = ({ milestone, index, onChange, onRemove, canRemove, budget, allocatedSoFar }) => {
  const [expanded, setExpanded] = useState(true);

  const set = useCallback(
    <K extends keyof CreateMilestoneDto>(key: K, value: CreateMilestoneDto[K]) => {
      onChange({ ...milestone, [key]: value });
    },
    [milestone, onChange]
  );

  const remaining = budget !== null ? budget - allocatedSoFar + milestone.paymentAllocation : null;

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
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--color-surface-subtle)',
          cursor: 'pointer',
          gap: '12px',
        }}
        onClick={() => setExpanded((p) => !p)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {index + 1}
          </div>
          <span style={{ fontWeight: 600, fontSize: '14px' }}>Milestone {index + 1}</span>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              {milestone.allocatedDays}d
            </span>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              ₹{Number(milestone.paymentAllocation || 0).toLocaleString()}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {canRemove && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-error)',
                padding: '4px',
              }}
            >
              <Trash2 size={15} />
            </button>
          )}
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Numeric fields */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '14px',
            }}
          >
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                  marginBottom: '6px',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <Calendar size={12} /> Days Allocated
              </label>
              <input
                type="number"
                min={1}
                value={milestone.allocatedDays}
                onChange={(e) => set('allocatedDays', Math.max(1, parseInt(e.target.value) || 1))}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                  marginBottom: '6px',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <DollarSign size={12} /> Payment (₹)
                {remaining !== null && (
                  <span style={{ marginLeft: '6px', fontSize: '10px', color: 'var(--color-text-tertiary)', fontWeight: 400 }}>
                    max ₹{remaining.toLocaleString()}
                  </span>
                )}
              </label>
              <input
                type="number"
                min={1}
                value={milestone.paymentAllocation || ''}
                onChange={(e) => set('paymentAllocation', parseFloat(e.target.value) || 0)}
                placeholder="Amount"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: `1px solid ${remaining !== null && milestone.paymentAllocation > remaining ? 'var(--color-error)' : 'var(--color-border)'}`,
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                  marginBottom: '6px',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <RefreshCw size={12} /> Revision Limit
              </label>
              <input
                type="number"
                min={0}
                max={10}
                value={milestone.revisionLimit}
                onChange={(e) => set('revisionLimit', Math.max(0, parseInt(e.target.value) || 0))}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Requirements */}
          <ListEditor<CreateMilestoneRequirementDto>
            label="Requirements"
            icon={Target}
            items={milestone.requirements}
            onChange={(items) => set('requirements', items)}
          />

          {/* Deliverables */}
          <ListEditor<CreateMilestoneDeliverableDto>
            label="Deliverables"
            icon={Package}
            items={milestone.deliverables}
            onChange={(items) => set('deliverables', items)}
            extraField={(item, _idx, update) => (
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={(item as CreateMilestoneDeliverableDto).isMandatory !== false}
                  onChange={(e) => update({ isMandatory: e.target.checked } as any)}
                />
                Mandatory
              </label>
            )}
          />

          {/* Acceptance Criteria */}
          <ListEditor<CreateMilestoneAcceptanceCriteriaDto>
            label="Acceptance Criteria"
            icon={ListChecks}
            items={milestone.acceptanceCriteria}
            onChange={(items) => set('acceptanceCriteria', items)}
          />
        </div>
      )}
    </div>
  );
};

export const ExecutionPlanBuilder: React.FC<ExecutionPlanBuilderProps> = ({
  projectId,
  onSubmit,
  onCancel,
  isSubmitting,
  initialData,
}) => {
  const { data: agreement } = useAgreement(projectId, 'PROFESSIONALS_ASSIGNED');
  const { data: participantsData } = useAgreementParticipants(projectId, 'PROFESSIONALS_ASSIGNED');

  const professionals = (participantsData?.participants ?? []).filter(
    (p) => p.invitationStatus === 'ACCEPTED' && p.role === 'PROFESSIONAL'
  );

  const [sections, setSections] = useState<ProfessionalSection[]>(() => {
    if (initialData) return initialData.professionals as ProfessionalSection[];
    return professionals.map((p) => ({
      agreementParticipantId: p.id,
      milestones: [emptyMilestone()],
    }));
  });

  // Participants arrive asynchronously. Seed the form once they are available,
  // but never replace milestones the user has already entered.
  useEffect(() => {
    if (initialData || sections.length > 0 || professionals.length === 0) return;
    setSections(professionals.map((p) => ({
      agreementParticipantId: p.id,
      milestones: [emptyMilestone()],
    })));
  }, [initialData, professionals, sections.length]);

  const updateSection = (idx: number, updated: ProfessionalSection) => {
    setSections((prev) => prev.map((s, i) => (i === idx ? updated : s)));
  };

  const addMilestone = (sectionIdx: number) => {
    const s = sections[sectionIdx];
    updateSection(sectionIdx, { ...s, milestones: [...s.milestones, emptyMilestone()] });
  };

  const removeMilestone = (sectionIdx: number, mIdx: number) => {
    const s = sections[sectionIdx];
    updateSection(sectionIdx, { ...s, milestones: s.milestones.filter((_, i) => i !== mIdx) });
  };

  const updateMilestone = (sectionIdx: number, mIdx: number, updated: CreateMilestoneDto) => {
    const s = sections[sectionIdx];
    updateSection(sectionIdx, {
      ...s,
      milestones: s.milestones.map((m, i) => (i === mIdx ? updated : m)),
    });
  };

  const budget = agreement?.budget ?? null;
  const totalAllocated = sections.flatMap((s) => s.milestones).reduce(
    (sum, m) => sum + (Number(m.paymentAllocation) || 0),
    0
  );
  const budgetMismatch = budget !== null ;

  const handleSubmit = async () => {
    if (sections.length === 0) {
      toast.error('No accepted professionals are available for this execution plan.');
      return;
    }
    // Validate checklist content
    for (const section of sections) {
      for (const m of section.milestones) {
        for (const r of m.requirements) {
          if (!r.content.trim()) {
            toast.error('Requirement content cannot be empty.');
            return;
          }
        }
        for (const d of m.deliverables) {
          if (!d.content.trim()) {
            toast.error('Deliverable content cannot be empty.');
            return;
          }
        }
        for (const a of m.acceptanceCriteria) {
          if (!a.content.trim()) {
            toast.error('Acceptance criteria content cannot be empty.');
            return;
          }
        }
      }
    }

    if (budgetMismatch) {
      toast.error(
        `Total payment allocation (₹${totalAllocated.toLocaleString()}) must equal the agreement budget (₹${budget!.toLocaleString()}).`
      );
      return;
    }

    await onSubmit({ professionals: sections });
  };

  const getProfessionalName = (participantId: string) => {
    const p = professionals.find((x) => x.id === participantId);
    if (!p) return 'Professional';
    const profile = p.profile ?? p.user?.profile;
    if (!profile) return 'Professional';
    return `${profile.firstName} ${profile.lastName} (@${profile.username})`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Budget overview */}
      {budget !== null && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '10px',
            border: `1px solid ${budgetMismatch ? 'var(--color-error)' : 'var(--color-border)'}`,
            backgroundColor: budgetMismatch ? 'var(--color-error-light)' : 'var(--color-surface-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          {budgetMismatch ? (
            <AlertTriangle size={18} color="var(--color-error)" />
          ) : (
            <CheckCircle2 size={18} color="var(--color-success)" />
          )}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: budgetMismatch ? 'var(--color-error)' : 'var(--color-text-primary)' }}>
              Budget Allocation
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Allocated: ₹{totalAllocated.toLocaleString()} / Budget: ₹{budget.toLocaleString()}
              {budgetMismatch && (
                <span style={{ marginLeft: '8px', color: 'var(--color-error)' }}>
                  (difference: ₹{Math.abs(totalAllocated).toLocaleString()})
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Professional sections */}
      {sections.map((section, sIdx) => (
        <div
          key={section.agreementParticipantId}
          style={{
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          {/* Section header */}
          <div
            style={{
              padding: '14px 18px',
              backgroundColor: 'var(--color-surface-subtle)',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px' }}>
                {getProfessionalName(section.agreementParticipantId)}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
                {section.milestones.length} milestone{section.milestones.length !== 1 ? 's' : ''}
                {' · '}
                ₹{section.milestones.reduce((s, m) => s + (Number(m.paymentAllocation) || 0), 0).toLocaleString()} allocated
              </div>
            </div>
          </div>

          {/* Milestones */}
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {section.milestones.map((milestone, mIdx) => {
              const allocatedSoFar = section.milestones
                .filter((_, i) => i !== mIdx)
                .reduce((s, m) => s + (Number(m.paymentAllocation) || 0), 0);
              return (
                <MilestoneForm
                  key={mIdx}
                  milestone={milestone}
                  index={mIdx}
                  onChange={(updated) => updateMilestone(sIdx, mIdx, updated)}
                  onRemove={() => removeMilestone(sIdx, mIdx)}
                  canRemove={section.milestones.length > 1}
                  budget={1200}
                  allocatedSoFar={allocatedSoFar}
                />
              );
            })}

            <button
              type="button"
              onClick={() => addMilestone(sIdx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '10px',
                border: '1px dashed var(--color-border)',
                borderRadius: '8px',
                background: 'none',
                cursor: 'pointer',
                color: 'var(--color-primary)',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              <Plus size={14} /> Add Milestone
            </button>
          </div>
        </div>
      ))}

      {/* Action buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px', borderTop: '1px solid var(--color-border)' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
            background: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || (budget !== null && budgetMismatch)}
          style={{
            padding: '10px 24px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: isSubmitting || (budget !== null && budgetMismatch) ? 'var(--color-border)' : 'var(--color-primary)',
            color: isSubmitting || (budget !== null && budgetMismatch) ? 'var(--color-text-tertiary)' : 'white',
            cursor: isSubmitting || (budget !== null && budgetMismatch) ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          {isSubmitting ? 'Saving…' : 'Save Execution Plan'}
        </button>
      </div>
    </div>
  );
};
