/**
 * User Model
 */

export interface User {
  id: string;
  username: string;
  roles: string[];
  features: string[];
  email?: string;
  fullName?: string;
}
