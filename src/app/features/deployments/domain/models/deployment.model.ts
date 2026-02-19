export type DeploymentStatus = 'pending' | 'approved' | 'running' | 'success' | 'failed';

export interface DeploymentStep {
  id: string;
  title: string;
  status: 'idle' | 'running' | 'done' | 'error';
  log: string;
}

export interface DeploymentLog {
  at: Date;
  message: string;
  level: 'info' | 'warn' | 'error';
  actor: string;
}

export interface DeploymentAuditEntry {
  at: Date;
  actor: string;
  from: DeploymentStatus | null;
  to: DeploymentStatus;
  note?: string;
}

export interface Deployment {
  id: string;
  name: string;
  service: string;
  version: string;
  status: DeploymentStatus;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  steps: DeploymentStep[];
  logs: DeploymentLog[];
  audit: DeploymentAuditEntry[];
}
