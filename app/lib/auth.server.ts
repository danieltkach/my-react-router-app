import { redirect } from "react-router";
import type { User } from "~/types/user";

// 🎯 Teaching Point: Server-side session checking
export async function getUser(request: Request): Promise<User | null> {
  const cookie = request.headers.get("Cookie");

  // Mock user lookup based on session cookie
  if (cookie?.includes("session=admin")) {
    return {
      id: "1",
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
      permissions: ["read", "write", "delete", "manage_users", "manage_system", "view_analytics"],
      department: "IT"
    };
  }

  if (cookie?.includes("session=manager")) {
    return {
      id: "2",
      name: "Manager User",
      email: "manager@example.com",
      role: "manager",
      permissions: ["read", "write", "manage_users", "view_analytics"],
      department: "Sales"
    };
  }

  if (cookie?.includes("session=user")) {
    return {
      id: "3",
      name: "Regular User",
      email: "user@example.com",
      role: "user",
      permissions: ["read", "write_own"],
      department: "Marketing"
    };
  }

  return null;
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
    throw new Response("Forbidden", { status: 403 });
  }
  return user;
}

export async function requirePermission(request: Request, permission: string): Promise<User> {
  const user = await requireUser(request);
  if (!user.permissions.includes(permission)) {
    throw new Response("Forbidden", { status: 403 });
  }
  return user;
}

// 🎯 Teaching Point: Role hierarchy system
function hasRoleAccess(userRole: string, requiredRole: string): boolean {
  const hierarchy = { admin: 3, manager: 2, user: 1 };
  const userLevel = hierarchy[userRole as keyof typeof hierarchy] || 0;
  const requiredLevel = hierarchy[requiredRole as keyof typeof hierarchy] || 0;
  return userLevel >= requiredLevel;
}

export async function createSession(email: string, password: string): Promise<string | null> {
  // 🎯 Teaching Point: Authentication logic
  const demoCredentials = {
    "admin@example.com": "admin",
    "manager@example.com": "manager",
    "user@example.com": "user"
  };

  const userRole = demoCredentials[email as keyof typeof demoCredentials];

  if (userRole && password === "password") {
    return `session=${userRole}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`;
  }

  return null;
}

export function destroySession(): string {
  return "session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0";
}
