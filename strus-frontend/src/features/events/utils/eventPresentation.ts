import { 
  CheckCircle, 
  Clock, 
  FileText, 
  MessageSquare, 
  AlertCircle, 
  FileEdit,
  Bell
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { EVENT_TYPES } from '../types/event.types';
import type { EventType } from '../types/event.types';

export interface EventPresentation {
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export function getEventPresentation(type: string): EventPresentation {
  switch (type as EventType) {
    case EVENT_TYPES.SUBMISSION_CREATED:
    case EVENT_TYPES.EXECUTION_PLAN_CREATED:
    case EVENT_TYPES.PROJECT_ASSET_SHARED:
      return {
        icon: FileText,
        color: 'var(--color-primary)',
        bgColor: 'var(--color-primary-light)',
      };
      
    case EVENT_TYPES.SUBMISSION_APPROVED:
    case EVENT_TYPES.MILESTONE_COMPLETED:
    case EVENT_TYPES.PROJECT_COMPLETED:
    case EVENT_TYPES.DISPUTE_RESOLVED:
    case EVENT_TYPES.NEGOTIATION_ACCEPTED:
    case EVENT_TYPES.EXTENSION_GRANTED:
      return {
        icon: CheckCircle,
        color: 'var(--color-success)',
        bgColor: 'var(--color-success-light)',
      };

    case EVENT_TYPES.REVISION_REQUESTED:
    case EVENT_TYPES.EXECUTION_PLAN_UPDATED:
    case EVENT_TYPES.AGREEMENT_UPDATED:
      return {
        icon: FileEdit,
        color: 'var(--color-warning)',
        bgColor: 'var(--color-warning-light)',
      };

    case EVENT_TYPES.MILESTONE_STARTED:
    case EVENT_TYPES.EXTENSION_REQUEST_CREATED:
      return {
        icon: Clock,
        color: 'var(--color-info)',
        bgColor: 'var(--color-info-light)',
      };

    case EVENT_TYPES.NEGOTIATION_DECLINED:
    case EVENT_TYPES.EXTENSION_REJECTED:
    case EVENT_TYPES.DISPUTE_CREATED:
      return {
        icon: AlertCircle,
        color: 'var(--color-error)',
        bgColor: 'var(--color-error-light)',
      };

    case EVENT_TYPES.AGREEMENT_CREATED:
    case EVENT_TYPES.AGREEMENT_INVITATION_CREATED:
    case EVENT_TYPES.NEGOTIATION_CREATED:
      return {
        icon: MessageSquare,
        color: 'var(--color-primary)',
        bgColor: 'var(--color-primary-light)',
      };

    default:
      return {
        icon: Bell,
        color: 'var(--color-text-secondary)',
        bgColor: 'var(--color-surface-hover)',
      };
  }
}
