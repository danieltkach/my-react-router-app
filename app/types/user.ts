export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "user";
  permissions: string[];
  department?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Extended user types for specific use cases
export interface UserProfile extends User {
  avatar?: string;
  phone?: string;
  address?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: "light" | "dark";
  notifications: boolean;
  language: string;
}

// For user creation/registration (subset of User)
export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "manager" | "user";
  department?: string;
}

// For user updates (all fields optional except id)
export interface UpdateUserData {
  id: string;
  name?: string;
  email?: string;
  role?: "admin" | "manager" | "user";
  department?: string;
  permissions?: string[];
}