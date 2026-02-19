import { Preferences } from '../models/admin.model';

export interface RoleDTO {
  id: string;
  name: string;
  permissions: { resource: string; actions: string[] }[];
}

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  roles: string[];
  features: string[];
  preferences: Preferences;
}

export interface FeatureFlagDTO {
  key: string;
  enabled: boolean;
  description?: string;
}

export interface AdminStateDTO {
  users: UserDTO[];
  roles: RoleDTO[];
  featureFlags: FeatureFlagDTO[];
  currentUser: UserDTO | null;
}
