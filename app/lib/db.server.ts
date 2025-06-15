import type { User } from "~/types/user";

// 🎯 Teaching Point: Database abstraction layer
interface DbUser {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

// Mock database - replace with Prisma, Drizzle, etc.
const mockUsers: DbUser[] = [
  { id: "1", email: "admin@example.com", name: "Admin User", role: "admin", created_at: "2024-01-01" },
  { id: "2", email: "manager@example.com", name: "Manager User", role: "manager", created_at: "2024-01-01" },
  { id: "3", email: "user@example.com", name: "Regular User", role: "user", created_at: "2024-01-01" }
];

export async function getUserById(id: string): Promise<User | null> {
  // Simulate database query
  await new Promise(resolve => setTimeout(resolve, 100));

  const dbUser = mockUsers.find(u => u.id === id);
  if (!dbUser) return null;

  return transformDbUser(dbUser);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  await new Promise(resolve => setTimeout(resolve, 100));

  const dbUser = mockUsers.find(u => u.email === email);
  if (!dbUser) return null;

  return transformDbUser(dbUser);
}

export async function createUser(userData: Partial<User>): Promise<User> {
  await new Promise(resolve => setTimeout(resolve, 200));

  const newUser: DbUser = {
    id: Date.now().toString(),
    email: userData.email!,
    name: userData.name!,
    role: userData.role || "user",
    created_at: new Date().toISOString()
  };

  mockUsers.push(newUser);
  return transformDbUser(newUser);
}

// 🎯 Teaching Point: Transform database models to app models
function transformDbUser(dbUser: DbUser): User {
  const permissions = getRolePermissions(dbUser.role);

  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role as "admin" | "manager" | "user",
    permissions
  };
}

function getRolePermissions(role: string): string[] {
  const permissionMap = {
    admin: ["read", "write", "delete", "manage_users", "manage_system", "view_analytics"],
    manager: ["read", "write", "manage_users", "view_analytics"],
    user: ["read", "write_own"]
  };

  return permissionMap[role as keyof typeof permissionMap] || [];
}