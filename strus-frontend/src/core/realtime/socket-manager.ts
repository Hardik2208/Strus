import { io, Socket } from "socket.io-client";
import { env } from "../../lib/config/env";
import { tokenManager } from "../../lib/auth/token-manager";
import type { SocketStatus, RealtimeEvent } from "./socket-types";

type EventHandler = (event: RealtimeEvent) => void;

class SocketManager {
  private socket: Socket | null = null;
  private status: SocketStatus = "disconnected";

  private subscribers = new Map<string, Set<EventHandler>>();
  private processedEventIds = new Set<string>();
  private statusListeners = new Set<(status: SocketStatus) => void>();

  public connect(): void {
    const token = tokenManager.getAccessToken();

    if (!token) {
      return;
    }

    // Prevent creating another socket while the existing socket
    // is connected, connecting, or attempting reconnection.
    if (this.socket?.connected || this.socket?.active) {
      return;
    }

    this.setStatus("connecting");

    // Reuse an existing inactive socket instead of creating another one.
    if (this.socket) {
      this.socket.connect();
      return;
    }

    const baseUrl = env.API_BASE_URL.replace(/\/api\/v1$/, "");

    const socket = io(baseUrl, {
      auth: (callback) => {
        callback({
          token: tokenManager.getAccessToken(),
        });
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
    });

    this.socket = socket;

    socket.on("connect", () => {
      this.setStatus("connected");
    });

    socket.on("disconnect", () => {
      this.setStatus("disconnected");
    });

    socket.on("connect_error", () => {
      this.setStatus("reconnecting");
    });

    socket.onAny((eventName, ...args) => {
      try {
        const payload = args[0] ?? {};

        const event: RealtimeEvent = {
          id: payload?.eventId || crypto.randomUUID(),
          type: eventName,
          data: payload,
          timestamp: new Date().toISOString(),
        };

        this.handleEvent(event);
      } catch {
        // Ignore malformed socket payloads.
      }
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.setStatus("disconnected");
  }

    public emit(eventType: string, payload: unknown): void {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit(eventType, payload);
  }
  
  public subscribe(
    eventType: string,
    handler: EventHandler
  ): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }

    this.subscribers.get(eventType)!.add(handler);

    return () => {
      const handlers = this.subscribers.get(eventType);

      if (!handlers) return;

      handlers.delete(handler);

      if (handlers.size === 0) {
        this.subscribers.delete(eventType);
      }
    };
  }

  public onStatusChange(
    listener: (status: SocketStatus) => void
  ): () => void {
    this.statusListeners.add(listener);
    listener(this.status);

    return () => {
      this.statusListeners.delete(listener);
    };
  }

  private handleEvent(event: RealtimeEvent): void {
    if (!event?.type) return;

    if (event.id) {
      if (this.processedEventIds.has(event.id)) {
        return;
      }

      this.processedEventIds.add(event.id);

      // Keep the deduplication cache bounded.
      if (this.processedEventIds.size > 1000) {
        const iterator = this.processedEventIds.values();

        for (let i = 0; i < 500; i++) {
          const oldestId = iterator.next().value;
          if (oldestId) {
            this.processedEventIds.delete(oldestId);
          }
        }
      }
    }

    const handlers = this.subscribers.get(event.type);

    if (!handlers) return;

    // One failing subscriber must not block other subscribers.
    handlers.forEach((handler) => {
      try {
        handler(event);
      } catch {
        // Keep other event subscribers operational.
      }
    });
  }

  private setStatus(status: SocketStatus): void {
    if (this.status === status) return;

    this.status = status;

    this.statusListeners.forEach((listener) => {
      try {
        listener(status);
      } catch {
        // Status listener failures must not affect the socket.
      }
    });
  }
}

export const socketManager = new SocketManager();
