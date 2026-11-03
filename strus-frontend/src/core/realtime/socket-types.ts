export type SocketStatus = "connecting" | "connected" | "disconnected" | "reconnecting";

export interface RealtimeEvent<T = any> {
  id: string;
  type: string;
  timestamp: string;
  data: T;
}
