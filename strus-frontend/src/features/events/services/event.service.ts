import { apiClient } from '../../../lib/api/api-client';
import type { EventListResponse } from '../types/event.types';

class EventService {
  private readonly baseUrl = '/events';

  async getEvents(cursor?: string | null, limit: number = 20): Promise<EventListResponse> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (cursor) {
      params.append('cursor', cursor);
    }
    
    // We assume the backend wraps the data in standard ApiSuccess response.
    // The ApiClient extracts response.data for us.
    const response = await apiClient.get<EventListResponse>(`${this.baseUrl}?${params.toString()}`);
    return response.data;
  }

  // getUnreadCount removed as endpoint doesn't exist

  async markAsRead(eventId: string): Promise<void> {
    await apiClient.patch(`${this.baseUrl}/${eventId}/read`, {});
  }

  async markAllAsRead(): Promise<void> {
    await apiClient.post(`${this.baseUrl}/read-all`, {});
  }
}

export const eventService = new EventService();
