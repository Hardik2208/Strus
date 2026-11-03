import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventService } from '../services/event.service';
import type { AppEvent } from '../types/event.types';

export const EVENT_QUERY_KEYS = {
  all: ['events'] as const,
  lists: () => [...EVENT_QUERY_KEYS.all, 'list'] as const,
};

export function useEventList(limit: number = 20) {
  return useInfiniteQuery({
    queryKey: EVENT_QUERY_KEYS.lists(),
    queryFn: ({ pageParam }) => eventService.getEvents(pageParam, limit),
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? null,
    initialPageParam: null as string | null,
  });
}

// unread-count API removed per instructions

export function useMarkEventRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => eventService.markAsRead(eventId),
    onSuccess: (_, eventId) => {
      // Optimistically update the event list
      queryClient.setQueryData(EVENT_QUERY_KEYS.lists(), (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.map((event: AppEvent) => 
              event.id === eventId 
                ? { ...event, readAt: new Date().toISOString() } 
                : event
            )
          }))
        };
      });
    }
  });
}

export function useMarkAllEventsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => eventService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_QUERY_KEYS.lists() });
    }
  });
}
