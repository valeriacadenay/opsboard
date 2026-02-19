export interface Permission {
  resource: string;
  actions: string[];
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

export interface Preferences {
  theme: 'light' | 'dark';
  language: 'en' | 'es';
}

export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  features: string[];
  preferences: Preferences;
}

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description?: string;
}

export interface AdminStateModel {
  users: User[];
  roles: Role[];
  featureFlags: FeatureFlag[];
  currentUser: User | null;
}
