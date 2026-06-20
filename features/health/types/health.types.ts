export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime?: number;
  version?: string;
}
