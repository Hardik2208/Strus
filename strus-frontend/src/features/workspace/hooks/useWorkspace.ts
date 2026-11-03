import { workspaceService } from '../api/workspace.service';
import type { 
  CreateWorkspaceRequest, 
  UpdateWorkspaceRequest,
  TransferOwnershipRequest,
  UpdateMemberRoleRequest,
  InviteMemberRequest
} from '../types/workspace.types';

import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';

export const workspaceKeys = {
  all: ['workspaces'] as const,
  lists: () => [...workspaceKeys.all, 'list'] as const,
  list: (page: number, limit: number) => [...workspaceKeys.lists(), { page, limit }] as const,
  details: () => [...workspaceKeys.all, 'detail'] as const,
  detail: (id: string) => [...workspaceKeys.details(), id] as const,
  members: (id: string) => [...workspaceKeys.detail(id), 'members'] as const,
  invitations: (id: string) => [...workspaceKeys.detail(id), 'invitations'] as const,
  pendingInvitations: () => [...workspaceKeys.all, 'pending-invitations'] as const,
  audit: (id: string) => [...workspaceKeys.detail(id), 'audit'] as const,
  infiniteList: (limit: number) => [...workspaceKeys.lists(), 'infinite', { limit }] as const,
};

export const useWorkspacesList = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: workspaceKeys.list(page, limit),
    queryFn: () => workspaceService.listWorkspaces(page, limit)
  });
};

export const useWorkspaceDetail = (workspaceId: string) => {
  return useQuery({
    queryKey: workspaceKeys.detail(workspaceId),
    queryFn: () => workspaceService.getWorkspace(workspaceId).then(res => res.data),
    enabled: !!workspaceId,
    retry: (failureCount, error: any) => {
      // Do not retry if the error is 403 (Forbidden) or 404 (Not Found)
      // This immediately fails the query and removes access for users kicked out
      if (error?.response?.status === 403 || error?.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    }
  });
};

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWorkspaceRequest) => workspaceService.createWorkspace(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
    }
  });
};

export const useUpdateWorkspace = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateWorkspaceRequest) => workspaceService.updateWorkspace(workspaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.detail(workspaceId) });
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
    }
  });
};

export const useDeleteWorkspace = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => workspaceService.deleteWorkspace(workspaceId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: workspaceKeys.detail(workspaceId) });
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
    }
  });
};

export const useLeaveWorkspace = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => workspaceService.leaveWorkspace(workspaceId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: workspaceKeys.detail(workspaceId) });
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
    }
  });
};

export const useTransferOwnership = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TransferOwnershipRequest) => workspaceService.transferOwnership(workspaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.detail(workspaceId) });
      queryClient.invalidateQueries({ queryKey: workspaceKeys.members(workspaceId) });
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
    }
  });
};

export const useWorkspaceMembers = (workspaceId: string, page = 1, limit = 10) => {
  return useQuery({
    queryKey: [...workspaceKeys.members(workspaceId), { page, limit }],
    queryFn: () => workspaceService.getMembers(workspaceId, page, limit).then(res => res.data),
    enabled: !!workspaceId,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 403 || error?.response?.status === 404) return false;
      return failureCount < 3;
    }
  });
};

export const useUpdateMemberRole = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, data }: { memberId: string, data: UpdateMemberRoleRequest }) => 
      workspaceService.updateMemberRole(workspaceId, memberId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.members(workspaceId) });
    }
  });
};

export const useRemoveMember = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => workspaceService.removeMember(workspaceId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.members(workspaceId) });
    }
  });
};

export const useWorkspaceInvitations = (workspaceId: string, page = 1, limit = 10) => {
  return useQuery({
    queryKey: [...workspaceKeys.invitations(workspaceId), { page, limit }],
    queryFn: () => workspaceService.getInvitations(workspaceId, page, limit).then(res => res.data),
    enabled: !!workspaceId,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 403 || error?.response?.status === 404) return false;
      return failureCount < 3;
    }
  });
};

export const useInviteMember = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InviteMemberRequest) => workspaceService.createInvitation(workspaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.invitations(workspaceId) });
    }
  });
};

export const useCancelInvitation = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) => workspaceService.cancelInvitation(workspaceId, invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.invitations(workspaceId) });
    }
  });
};



export const useAcceptWorkspaceInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) =>
      workspaceService.acceptInvitation(invitationId),

    onSuccess: async () => {
      await Promise.all([
        // Remove accepted invitation from recipient's pending list.
        queryClient.invalidateQueries({
          queryKey: workspaceKeys.pendingInvitations(),
        }),

        // Refresh workspace membership and workspace switcher data.
        queryClient.invalidateQueries({
          queryKey: workspaceKeys.lists(),
        }),
      ]);
    },
  });
};

export const useDeclineWorkspaceInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) =>
      workspaceService.declineInvitation(invitationId),

    onSuccess: async () => {
      // Declining does not change workspace membership.
      await queryClient.invalidateQueries({
        queryKey: workspaceKeys.pendingInvitations(),
      });
    },
  });
};

export const usePendingWorkspaceInvitations = () => {
  return useQuery({
    queryKey: workspaceKeys.pendingInvitations(),
    queryFn: () => workspaceService.getPendingInvitations().then(res => res.data)
  });
};

export const useWorkspaceAudit = (workspaceId: string, page = 1, limit = 20) => {
  return useQuery({
    queryKey: [...workspaceKeys.audit(workspaceId), { page, limit }],
    queryFn: () => workspaceService.getAuditLogs(workspaceId, page, limit).then(res => res.data),
    enabled: !!workspaceId,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 403 || error?.response?.status === 404) return false;
      return failureCount < 3;
    }
  });
};

export const useInfiniteWorkspacesList = (limit = 10) => {
  return useInfiniteQuery({
    queryKey: workspaceKeys.infiniteList(limit),

    queryFn: ({ pageParam }) =>
      workspaceService.listWorkspaces(pageParam, limit),

    initialPageParam: 1,

    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNext
        ? lastPage.pagination.page + 1
        : undefined,
  });
};

export const useAllWorkspaceMembers = (
  workspaceId: string,
  enabled = true
) => {
  return useQuery({
    queryKey: [...workspaceKeys.members(workspaceId), 'all'],

    queryFn: async () => {
      const limit = 50;
      let page = 1;
      let hasNext = true;
      const allMembers: NonNullable<
        Awaited<ReturnType<typeof workspaceService.getMembers>>['data']
      >['members'] = [];

      while (hasNext) {
        const response = await workspaceService.getMembers(
          workspaceId,
          page,
          limit
        );

        const result = response.data;

        allMembers.push(...result.members);
        hasNext = result.pagination.hasNext;
        page += 1;
      }

      return allMembers;
    },

    enabled: !!workspaceId && enabled,
    staleTime: 30_000,
  });
};