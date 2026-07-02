import type { Request } from "express";

export class DeviceUtil {
  static identifier(req: Request): string {
    return (
      req.headers["x-device-id"]?.toString() ??
      "unknown-device"
    );
  }

  static platform(req: Request): string {
    return (
      req.headers["sec-ch-ua-platform"]?.toString() ??
      "WEB"
    );
  }

  static browser(req: Request): string {
    return req.get("user-agent") ?? "";
  }

  static os(req: Request): string {
    return (
      req.headers["sec-ch-ua-platform"]?.toString() ??
      "Unknown"
    );
  }
}