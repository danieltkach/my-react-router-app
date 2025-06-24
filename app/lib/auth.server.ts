import { redirect } from "react-router";
import { getUserId } from "./session.server";
import type { User } from "~/types/user";

const DEMO_USERS: Record<string, User> = {
  "1": {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    permissions: ["read", "write", "delete", "manage_users", "manage_system", "view_analytics"],
    department: "IT"
  },
  "2": {
    id: "2",
    name: "Manager User",
    email: "manager@example.com",
    role: "manager",
    permissions: ["read", "write", "manage_users", "view_analytics"],
    department: "Sales"
  },
  "3": {
    id: "3",
    name: "Regular User",
    email: "user@example.com",
    role: "user",
    permissions: ["read", "write_own"],
    department: "Marketing"
  }
};

// Demo credentials (in production, this would be a database query with hashed passwords)
const DEMO_CREDENTIALS: Record<string, string> = {
  "admin@example.com": "1", // email -> userId
  "manager@example.com": "2",
  "user@example.com": "3"
};

// 🎯 Get user by ID from session
export async function getUser(request: Request): Promise<User | null> {
  const userId = await getUserId(request);

  if (!userId) {
    return null;
  }

  // In production: const user = await db.user.findById(userId)
  const user = DEMO_USERS[userId];
  return user || null;
}

// 🎯 Get user by email (for login)
export async function getUserByEmail(email: string): Promise<User | null> {
  const userId = DEMO_CREDENTIALS[email];
  if (!userId) {
    return null;
  }

  return DEMO_USERS[userId] || null;
}

// 🎯 Verify password (in production, this would use bcrypt)
export async function verifyPassword(email: string, password: string): Promise<User | null> {
  // For demo, all passwords are "password"
  if (password !== "password") {
    return null;
  }

  return await getUserByEmail(email);
}

export async function requireUser(request: Request): Promise<User> {
  const user = await getUser(request);

  if (!user) {
    throw redirect("/auth/login");
  }

  return user;
}

export async function requireRole(request: Request, role: string): Promise<User> {
  const user = await requireUser(request);

  if (!hasRoleAccess(user.role, role)) {
    throw new Response("Forbidden: Insufficient permissions", { status: 403 });
  }

  return user;
}

function hasRoleAccess(userRole: string, requiredRole: string): boolean {
  const hierarchy = { admin: 3, manager: 2, user: 1 };
  const userLevel = hierarchy[userRole as keyof typeof hierarchy] || 0;
  const requiredLevel = hierarchy[requiredRole as keyof typeof hierarchy] || 0;
  return userLevel >= requiredLevel;
}

export async function requirePermission(request: Request, permission: string): Promise<User> {
  const user = await requireUser(request);

  if (!user.permissions.includes(permission)) {
    throw new Response("Forbidden: Missing required permission", { status: 403 });
  }

  return user;
}
