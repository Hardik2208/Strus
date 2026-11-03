

import type { WorkspaceDetail } from '../types/workspace.types';

export const workspacePermissions = {
  canEditWorkspace: (workspace: WorkspaceDetail, role: string) => {
    return workspace.workspaceType === 'TEAM' && role?.toUpperCase() === 'OWNER';
  },

  canInviteMembers: (workspace: WorkspaceDetail, role: string) => {
    return workspace.workspaceType === 'TEAM' && role?.toUpperCase() === 'OWNER';
  },

  canChangeMemberRole: (workspace: WorkspaceDetail, role: string) => {
    return workspace.workspaceType === 'TEAM' && role?.toUpperCase() === 'OWNER';
  },

  canRemoveMember: (workspace: WorkspaceDetail, role: string) => {
    return workspace.workspaceType === 'TEAM' && role?.toUpperCase() === 'OWNER';
  },

  canTransferOwnership: (workspace: WorkspaceDetail, role: string) => {
    return workspace.workspaceType === 'TEAM' && role?.toUpperCase() === 'OWNER';
  },

  canDeleteWorkspace: (workspace: WorkspaceDetail, role: string) => {
    return workspace.workspaceType === 'TEAM' && role?.toUpperCase() === 'OWNER';
  },

  canLeaveWorkspace: (workspace: WorkspaceDetail, role: string) => {
    // Owner cannot leave until they transfer ownership
    return workspace.workspaceType === 'TEAM' && role?.toUpperCase() !== 'OWNER';
  },

  canViewAudit: () => {
    return true; // Any member can view audit log
  }
};
