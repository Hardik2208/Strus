import { io, Socket } from "socket.io-client";
import { env } from "../../lib/config/env";
import { tokenManager } from "../../lib/auth/token-manager";
import type { SocketStatus, RealtimeEvent } from "./socket-types";

type EventHandler = (event: RealtimeEvent) => void;

class SocketManager {
  private socket: Socket | null = null;
  private status: SocketStatus = "disconnected";
  
  private subscribers: Map<string, Set<EventHandler>> = new Map();
  private processedEventIds: Set<string> = new Set();
  
  private statusListeners: Set<(status: SocketStatus) => void> = new Set();

  public connect() {
    if (this.socket?.connected) {
      return;
    }

    const token = tokenManager.getAccessToken();
    if (!token) {
      return; // Cannot connect without auth
    }

    this.setStatus("connecting");

    // Standard base URL without `/api/v1`
    const baseUrl = env.API_BASE_URL.replace(/\/api\/v1$/, '');

    this.socket = io(baseUrl, {
      auth: (cb) => {
        cb({ token: tokenManager.getAccessToken() });
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
    });

    this.socket.on("connect", () => {
      this.setStatus("connected");
    });

    this.socket.on("disconnect", () => {
      this.setStatus("disconnected");
    });

    this.socket.on("connect_error", () => {
      // Intentionally omitting console.error to avoid leaking transport details
      this.setStatus("reconnecting");
    });

    // Handle incoming events from the server
    // The server emits named events or generic "event" payloads depending on backend implementation
    // For Strus, we listen to a catch-all if possible, or bind explicitly to documented events.
    this.socket.onAny((eventName, ...args) => {
      try {
        const payload = args[0] || {};
        const event: RealtimeEvent = {
          id: payload.eventId || crypto.randomUUID(), // Ensure an ID exists for deduplication
          type: eventName,
          data: payload,
          timestamp: new Date().toISOString()
        };
        this.handleEvent(event);
      } catch (e) {
        // Intentionally silent to prevent leaking payload parsing errors
      }
    });
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.setStatus("disconnected");
  }

  public subscribe(eventType: string, handler: EventHandler): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType)!.add(handler);

    // Return cleanup function
    return () => {
      const handlers = this.subscribers.get(eventType);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.subscribers.delete(eventType);
        }
      }
    };
  }

  public onStatusChange(listener: (status: SocketStatus) => void): () => void {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  private handleEvent(event: RealtimeEvent) {
    if (!event || !event.type) return;

    // Deduplication
    if (event.id) {
      if (this.processedEventIds.has(event.id)) {
        return;
      }
      this.processedEventIds.add(event.id);

      // Keep memory bounded
      if (this.processedEventIds.size > 1000) {
        const iterator = this.processedEventIds.values();
        for (let i = 0; i < 500; i++) {
          this.processedEventIds.delete(iterator.next().value!);
        }
      }
    }

    const handlers = this.subscribers.get(event.type);
    if (handlers) {
      handlers.forEach(handler => handler(event));
    }
  }

  private setStatus(status: SocketStatus) {
    if (this.status !== status) {
      this.status = status;
      this.statusListeners.forEach(listener => listener(status));
    }
  }
}

export const socketManager = new SocketManager();
