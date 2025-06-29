// lib/auth-v2.server.ts - Production Authentication API
import { redirect } from "react-router";
import bcrypt from "bcryptjs"; // You'll need: npm install bcryptjs @types/bcryptjs
import {
  createSession,
  validateSession,
  refreshSession,
  invalidateSession,
  invalidateAllUserSessions,
  serializeSession,
  clearSessionCookie,
  logAuditEvent
} from "./session-v2.server";
import {
  AuthErrorCode,
  Permission,
  UserRole,
  type UserV2,
  type LoginCredentials,
  type LoginResult,
  type AuthError,
  type CreateSessionOptions,
  type SessionV2,
  AuditEventType,
  type ROLE_PERMISSIONS
} from "~/types/auth-v2";

// 🎯 MOCK USER DATABASE (Replace with real database later)
const mockUsers: Map<string, UserV2 & { passwordHash: string; }> = new Map([
  ["admin@example.com", {
    id: "user-admin-1",
    email: "admin@example.com",
    name: "Admin User",
    role: UserRole.ADMIN,
    permissions: [Permission.READ, Permission.WRITE, Permission.DELETE, Permission.SYSTEM_ADMIN, Permission.MANAGE_USERS, Permission.MANAGE_PRODUCTS, Permission.VIEW_ANALYTICS],
    department: "IT",
    isActive: true,
    emailVerified: true,
    twoFactorEnabled: false,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    passwordHash: bcrypt.hashSync("password", 10) // In real app, hash during registration
  }],
  ["manager@example.com", {
    id: "user-manager-1",
    email: "manager@example.com",
    name: "Manager User",
    role: UserRole.MANAGER,
    permissions: [Permission.READ, Permission.WRITE, Permission.MANAGE_PRODUCTS, Permission.VIEW_ANALYTICS, Permission.MANAGE_ORDERS],
    department: "Sales",
    isActive: true,
    emailVerified: true,
    twoFactorEnabled: false,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    passwordHash: bcrypt.hashSync("password", 10)
  }],
  ["user@example.com", {
    id: "user-customer-1",
    email: "user@example.com",
    name: "Regular User",
    role: UserRole.USER,
    permissions: [Permission.READ, Permission.WRITE],
    isActive: true,
    emailVerified: true,
    twoFactorEnabled: false,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    passwordHash: bcrypt.hashSync("password", 10)
  }]
]);

// 🔧 UTILITY FUNCTIONS
function createAuthError(code: AuthErrorCode, message: string, details?: Record<string, any>): AuthError {
  return { code, message, details };
}

function getUserPermissions(role: UserRole): Permission[] {
  // Get base permissions for role, can be overridden per user
  switch (role) {
    case UserRole.ADMIN:
      return [Permission.READ, Permission.WRITE, Permission.DELETE, Permission.SYSTEM_ADMIN, Permission.MANAGE_USERS, Permission.MANAGE_PRODUCTS, Permission.VIEW_ANALYTICS, Permission.EXPORT_DATA, Permission.MANAGE_SETTINGS, Permission.MANAGE_ORDERS, Permission.PROCESS_PAYMENTS, Permission.MANAGE_INVENTORY];
    case UserRole.MANAGER:
      return [Permission.READ, Permission.WRITE, Permission.DELETE, Permission.VIEW_USERS, Permission.MANAGE_PRODUCTS, Permission.VIEW_ANALYTICS, Permission.MANAGE_ORDERS, Permission.MANAGE_INVENTORY];
    case UserRole.USER:
      return [Permission.READ, Permission.WRITE];
    case UserRole.GUEST:
      return [Permission.READ];
    default:
      return [Permission.READ];
  }
}

async function findUserByEmail(email: string): Promise<(UserV2 & { passwordHash: string; }) | null> {
  // TODO: Replace with real database query
  return mockUsers.get(email.toLowerCase()) || null;
}

async function findUserById(id: string): Promise<UserV2 | null> {
  // TODO: Replace with real database query
  for (const user of mockUsers.values()) {
    if (user.id === id) {
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
  }
  return null;
}

// ======================================
// 🎯 MAIN AUTHENTICATION API
// ======================================

/**
 * 🔐 LOGIN: Authenticate user and create session
 * This is the main login function your auth routes will use
 */
export async function login(
  request: Request,
  credentials: LoginCredentials,
  options: CreateSessionOptions = {}
): Promise<LoginResult> {

  const { email, password, remember = false } = credentials;

  console.log(`🔐 Login attempt for: ${email}`);

  // Rate limiting would go here in production
  // await checkRateLimit(request, email);

  try {
    // Find user
    const userWithPassword = await findUserByEmail(email);

    if (!userWithPassword) {
      logAuditEvent(AuditEventType.LOGIN_FAILURE, request, {
        success: false,
        error: "User not found",
        metadata: { email }
      });

      return {
        success: false,
        error: createAuthError(
          AuthErrorCode.INVALID_CREDENTIALS,
          "Invalid email or password"
        )
      };
    }

    // Check if account is active
    if (!userWithPassword.isActive) {
      logAuditEvent(AuditEventType.LOGIN_FAILURE, request, {
        userId: userWithPassword.id,
        success: false,
        error: "Account disabled"
      });

      return {
        success: false,
        error: createAuthError(
          AuthErrorCode.ACCOUNT_DISABLED,
          "Account has been disabled"
        )
      };
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, userWithPassword.passwordHash);

    if (!passwordValid) {
      logAuditEvent(AuditEventType.LOGIN_FAILURE, request, {
        userId: userWithPassword.id,
        success: false,
        error: "Invalid password"
      });

      return {
        success: false,
        error: createAuthError(
          AuthErrorCode.INVALID_CREDENTIALS,
          "Invalid email or password"
        )
      };
    }

    // Check if email is verified (optional check)
    if (!userWithPassword.emailVerified) {
      return {
        success: false,
        error: createAuthError(
          AuthErrorCode.EMAIL_NOT_VERIFIED,
          "Please verify your email address before logging in"
        )
      };
    }

    // Check if 2FA is required
    if (userWithPassword.twoFactorEnabled && !credentials.twoFactorCode) {
      return {
        success: false,
        requiresTwoFactor: true,
        error: createAuthError(
          AuthErrorCode.TWO_FACTOR_REQUIRED,
          "Two-factor authentication required"
        )
      };
    }

    // Create session
    const session = await createSession(
      request,
      userWithPassword.id,
      userWithPassword.role,
      userWithPassword.permissions,
      {
        remember,
        skipTwoFactor: !userWithPassword.twoFactorEnabled,
        ...options
      }
    );

    // Remove password from user object
    const { passwordHash, ...user } = userWithPassword;

    // Update last login time (would be database update in real app)
    user.lastLoginAt = new Date().toISOString();

    logAuditEvent(AuditEventType.LOGIN_SUCCESS, request, {
      userId: user.id,
      sessionId: session.sessionId,
      success: true,
      metadata: {
        role: user.role,
        remembered: remember,
        twoFactorUsed: userWithPassword.twoFactorEnabled
      }
    });

    console.log(`✅ Login successful for: ${email}`);

    return {
      success: true,
      user,
      session,
      redirectTo: "/dashboard" // Default redirect
    };

  } catch (error) {
    console.error("🚨 Login error:", error);

    logAuditEvent(AuditEventType.LOGIN_FAILURE, request, {
      success: false,
      error: "Internal error during login",
      metadata: { email }
    });

    return {
      success: false,
      error: createAuthError(
        AuthErrorCode.INTERNAL_ERROR,
        "An unexpected error occurred"
      )
    };
  }
}

/**
 * 🚪 LOGOUT: End user session and redirect
 */
export async function logout(request: Request, redirectTo: string = "/auth/login") {
  console.log("🚪 Logout request");

  // Invalidate current session
  await invalidateSession(request);

  // Clear session cookie
  const clearedCookie = await clearSessionCookie();

  const headers = new Headers();
  headers.append("Set-Cookie", clearedCookie);

  // Add security headers
  if (process.env.NODE_ENV === "production") {
    headers.append("Clear-Site-Data", '"cache", "cookies", "storage"');
  }

  console.log("✅ Logout complete, redirecting to:", redirectTo);
  return redirect(redirectTo, { headers });
}

/**
 * 👤 GET CURRENT USER: Get authenticated user from session
 * This is the main function your loaders will use
 */
export async function getCurrentUser(request: Request): Promise<UserV2 | null> {
  const validation = await validateSession(request);

  if (!validation.isValid || !validation.session) {
    return null;
  }

  // Get full user data
  const user = await findUserById(validation.session.userId);

  if (!user) {
    // User was deleted but session still exists
    await invalidateSession(request, validation.session.sessionId);
    return null;
  }

  return user;
}

/**
 * 🔒 REQUIRE AUTHENTICATION: Ensure user is logged in
 * This is what your protected routes will use
 */
export async function requireAuth(request: Request): Promise<{ user: UserV2; session: SessionV2; }> {
  const validation = await validateSession(request);

  if (!validation.isValid || !validation.session) {
    console.log("🚫 Authentication required, redirecting to login");
    throw redirect("/auth/login");
  }

  const user = await findUserById(validation.session.userId);

  if (!user) {
    console.log("🚫 User not found, clearing session");
    await invalidateSession(request, validation.session.sessionId);
    throw redirect("/auth/login");
  }

  return { user, session: validation.session };
}

/**
 * 👑 REQUIRE ROLE: Ensure user has specific role
 */
export async function requireRole(
  request: Request,
  requiredRole: UserRole,
  allowHigherRoles: boolean = true
): Promise<{ user: UserV2; session: SessionV2; }> {

  const { user, session } = await requireAuth(request);

  const roleHierarchy = [UserRole.GUEST, UserRole.USER, UserRole.MANAGER, UserRole.ADMIN];
  const userRoleLevel = roleHierarchy.indexOf(user.role);
  const requiredRoleLevel = roleHierarchy.indexOf(requiredRole);

  const hasAccess = allowHigherRoles
    ? userRoleLevel >= requiredRoleLevel
    : user.role === requiredRole;

  if (!hasAccess) {
    console.log(`🚫 Role access denied. Required: ${requiredRole}, User: ${user.role}`);

    logAuditEvent(AuditEventType.PERMISSION_DENIED, request, {
      userId: user.id,
      sessionId: session.sessionId,
      success: false,
      metadata: {
        requiredRole,
        userRole: user.role,
        allowHigherRoles
      }
    });

    throw new Response("Forbidden", { status: 403 });
  }

  return { user, session };
}

/**
 * 🔐 REQUIRE PERMISSION: Ensure user has specific permission
 */
export async function requirePermission(
  request: Request,
  requiredPermission: Permission
): Promise<{ user: UserV2; session: SessionV2; }> {

  const { user, session } = await requireAuth(request);

  if (!user.permissions.includes(requiredPermission)) {
    console.log(`🚫 Permission denied. Required: ${Permission[requiredPermission]}, User permissions:`, user.permissions.map(p => Permission[p]));

    logAuditEvent(AuditEventType.PERMISSION_DENIED, request, {
      userId: user.id,
      sessionId: session.sessionId,
      success: false,
      metadata: {
        requiredPermission: Permission[requiredPermission],
        userPermissions: user.permissions.map(p => Permission[p])
      }
    });

    throw new Response("Forbidden", { status: 403 });
  }

  logAuditEvent(AuditEventType.PERMISSION_GRANTED, request, {
    userId: user.id,
    sessionId: session.sessionId,
    success: true,
    metadata: {
      permission: Permission[requiredPermission]
    }
  });

  return { user, session };
}

/**
 * 🔄 CREATE SESSION REDIRECT: Login user and redirect with session cookie
 */
export async function createSessionAndRedirect(
  request: Request,
  user: UserV2,
  redirectTo: string = "/dashboard",
  options: CreateSessionOptions = {}
): Promise<Response> {

  const session = await createSession(
    request,
    user.id,
    user.role,
    user.permissions,
    options
  );

  const sessionCookie = await serializeSession(session);

  const headers = new Headers();
  headers.append("Set-Cookie", sessionCookie);

  console.log(`✅ Session created for ${user.email}, redirecting to: ${redirectTo}`);
  return redirect(redirectTo, { headers });
}

// ======================================
// 🔧 HELPER FUNCTIONS
// ======================================

/**
 * 📊 CHECK USER PERMISSION: Boolean check without throwing
 */
export async function hasPermission(request: Request, permission: Permission): Promise<boolean> {
  try {
    await requirePermission(request, permission);
    return true;
  } catch {
    return false;
  }
}

/**
 * 👑 CHECK USER ROLE: Boolean check without throwing
 */
export async function hasRole(request: Request, role: UserRole): Promise<boolean> {
  try {
    await requireRole(request, role);
    return true;
  } catch {
    return false;
  }
}

/**
 * 🔄 REFRESH CURRENT SESSION: Extend session expiry
 */
export async function refreshCurrentSession(request: Request): Promise<SessionV2 | null> {
  return await refreshSession(request);
}

/**
 * 🧹 LOGOUT ALL DEVICES: Invalidate all user sessions
 */
export async function logoutAllDevices(request: Request): Promise<Response> {
  const { user } = await requireAuth(request);

  const sessionCount = await invalidateAllUserSessions(user.id);

  console.log(`🧹 Logged out ${sessionCount} sessions for user: ${user.email}`);

  const clearedCookie = await clearSessionCookie();
  const headers = new Headers();
  headers.append("Set-Cookie", clearedCookie);

  return redirect("/auth/login", { headers });
}

// ======================================
// 🧪 DEVELOPMENT & TESTING UTILITIES
// ======================================

/**
 * 🧪 QUICK LOGIN: Development helper for testing
 */
export async function quickLogin(
  request: Request,
  userType: "admin" | "manager" | "user" = "user"
): Promise<Response> {

  if (process.env.NODE_ENV !== "development") {
    throw new Error("Quick login only available in development");
  }

  const emailMap = {
    admin: "admin@example.com",
    manager: "manager@example.com",
    user: "user@example.com"
  };

  const result = await login(request, {
    email: emailMap[userType],
    password: "password",
    remember: false
  });

  if (result.success && result.user) {
    return await createSessionAndRedirect(request, result.user, "/auth-v2-demo");
  } else {
    throw new Error(`Quick login failed: ${result.error?.message}`);
  }
}

/**
 * 🔍 GET SESSION INFO: Debug current session
 */
export async function getSessionInfo(request: Request) {
  const validation = await validateSession(request);
  const user = validation.session ? await findUserById(validation.session.userId) : null;

  return {
    isValid: validation.isValid,
    reason: validation.reason,
    session: validation.session,
    user,
    timestamp: new Date().toISOString()
  };
}
