import type { User } from "./user";

// Session-related types
export interface AuthSession {
  userId: string;
  role: string;
  expiresAt: Date;
}

// Login/authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  error?: string;
  sessionToken?: string;
}

// Context types for React components
export interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (role: string | string[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

// Guard component props
export interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole: string | string[];
  fallback?: React.ReactNode;
  hierarchical?: boolean;
}