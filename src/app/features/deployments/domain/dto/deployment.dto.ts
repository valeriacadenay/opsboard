import { DeploymentStatus } from '../models/deployment.model';

export interface DeploymentDTO {
  id: string;
  name: string;
  service: string;
  version: string;
  status: DeploymentStatus;
  progress: number;
  created_at: string;
  updated_at: string;
  steps: DeploymentStepDTO[];
  logs: DeploymentLogDTO[];
  audit: DeploymentAuditDTO[];
}

export interface DeploymentStepDTO {
  id: string;
  title: string;
  status: 'idle' | 'running' | 'done' | 'error';
  log: string;
}

export interface DeploymentLogDTO {
  at: string;
  message: string;
  level: 'info' | 'warn' | 'error';
  actor: string;
}

export interface DeploymentAuditDTO {
  at: string;
  actor: string;
  from: DeploymentStatus | null;
  to: DeploymentStatus;
  note?: string;
}

export interface DeploymentListResponseDTO {
  deployments: DeploymentDTO[];
  total: number;
}
