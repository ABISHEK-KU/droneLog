export interface Log {
  _id: string;
  drone: {
    _id: string;
    name: string;
    modelName: string;
    serial: string;
  };
  filename: string;
  path: string;
  size: number;
  startTime?: string;
  endTime?: string;
  durationSeconds?: number;
  gpsTrack?: Array<{ lat: number; lon: number; alt?: number; ts?: number }>;
  messagesCount?: number;
  parsedSummary?: Record<string, any>;
  raw?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Incident {
  _id: string;
  drone: {
    _id: string;
    name: string;
    modelName: string;
    serial: string;
  };
  log?: {
    _id: string;
    filename: string;
  };
  title: string;
  description?: string;
  severity?: "low" | "medium" | "high";
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PrePostCheck {
  _id: string;
  drone: {
    _id: string;
    name: string;
    modelName: string;
    serial: string;
  };
  log: {
    _id: string;
    filename: string;
  };
  type: "pre" | "post";
  items: Array<{ name: string; ok: boolean; notes?: string }>;
  performedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LogsContextType {
  logsData: Log[];
  fetchLogs: () => Promise<void>;
  uploadLog: (file: File, droneId: string) => Promise<void>;
  deleteLog: (id: string) => Promise<void>;
}

export interface IncidentsContextType {
  incidentsData: Incident[];
  fetchIncidents: () => Promise<void>;
  fetchIncidentById: (id: string) => Promise<Incident>;
  createIncident: (incident: Omit<Incident, '_id' | 'createdAt' | 'updatedAt'>) => Promise<Incident>;
  updateIncident: (id: string, incident: Partial<Incident>) => Promise<Incident>;
  deleteIncident: (id: string) => Promise<void>;
}

export interface PrePostChecksContextType {
  checksData: PrePostCheck[];
  fetchChecks: () => Promise<void>;
  fetchCheckById: (id: string) => Promise<PrePostCheck>;
  createPrePostCheck: (check: Omit<PrePostCheck, '_id' | 'createdAt' | 'updatedAt'>) => Promise<PrePostCheck>;
  updatePrePostCheck: (id: string, check: Partial<PrePostCheck>) => Promise<PrePostCheck>;
  deletePrePostCheck: (id: string) => Promise<void>;
}
