// -------------------------
// Property Panel Data Types
// -------------------------
export interface StaticProperties {
  [key: string]: string | number | boolean | null; // You can make this stricter if you know exact fields
}

export interface DynamicProperties {
  [key: string]: any; // This can be typed more strictly if you know the exact observable schema
}

export interface PropertyPanelData {
  name: string;
  type: string;
  macId: string;
  staticProperties: StaticProperties;
  dynamicProperties: DynamicProperties;
}

// WebSocket incoming data (device detail updates)
export interface DeviceDetailUpdate {
  [key: string]: any; // The WebSocket sends only updated dynamic properties
}

// Dropdown device type
export interface DeviceNameMac {
  macId: string;
  name: string;
  deviceMacId?: string; // In ComboBox you seem to use `deviceMacId`
}


export interface Alarm {
  message: string;
  raisedAt: string;
}

export interface AlarmUpdateMessage {
  alarm: Alarm | null;
  totalAlarms: number;
}


