export interface DeviceInformation {
  deviceIdentifier: string;
  deviceName: string;
  platform: string;
  browser: string;
  operatingSystem: string;
}

const generateId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export const getDeviceInformation = (): DeviceInformation => {
  let deviceId = localStorage.getItem("strus_device_id");
  if (!deviceId) {
    deviceId = generateId();
    localStorage.setItem("strus_device_id", deviceId);
  }

  const ua = navigator.userAgent;
  let browser = "Unknown";
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("SamsungBrowser")) browser = "Samsung Browser";
  else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";
  else if (ua.includes("Trident")) browser = "Internet Explorer";
  else if (ua.includes("Edge")) browser = "Edge";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";

  let os = "Unknown";
  let platform = "LINUX";
  
  if (ua.indexOf("Win") !== -1) { os = "Windows"; platform = "WINDOWS"; }
  else if (/iPhone|iPad|iPod/.test(ua)) { os = "iOS"; platform = "IOS"; }
  else if (ua.indexOf("Mac") !== -1) { os = "macOS"; platform = "MACOS"; }
  else if (/Android/.test(ua)) { os = "Android"; platform = "ANDROID"; }
  else if (ua.indexOf("Linux") !== -1 || ua.indexOf("X11") !== -1) { os = "Linux"; platform = "LINUX"; }

  return {
    deviceIdentifier: deviceId,
    deviceName: `${browser} on ${os}`,
    platform,
    browser,
    operatingSystem: os,
  };
};
