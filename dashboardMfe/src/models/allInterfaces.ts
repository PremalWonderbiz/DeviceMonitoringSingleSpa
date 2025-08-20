// -------------------------
// Device-related interfaces
// -------------------------
export interface Device {
  macId: string;
  name: string;
  status: string;
  connectivity: string;
  lastUpdated: string; // ISO date string
}

export interface DeviceUpdateMessage {
  MacId: string;
  Status?: string;
  Connectivity?: string;
  LastUpdated?: string;
}

export interface DeviceFileNameMap {
  [macId: string]: string;
}

export interface DeviceNameMac {
  macId: string;
  name: string;
}

// -------------------------
// Alarm-related interfaces
// -------------------------
export interface Alarm {
  id: string;
  message: string;
  severity: string;
  timestamp: string; // ISO date string
}

export interface AlarmResponse {
  alarms: Alarm[];
  totalAlarms: number;
}

// -------------------------
// Table & Highlight Map
// -------------------------
export interface UpdatedFieldsMap {
  [macId: string]: string[];
}

// -------------------------
// API responses
// -------------------------
export interface PaginatedDeviceResponse {
  data: Device[];
  totalCount: number;
}

export interface MacIdToFileNameResponse {
  data: DeviceFileNameMap;
}

export interface DeviceNameMacListResponse {
  data: DeviceNameMac[];
}



// ***************************************************************************


