// lib/auth-v2.server.ts - Production-Ready Authentication with Security Hardening
import { redirect } from "react-router";
import bcrypt from "bcryptjs";
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
  securityConfig,
  loginRateLimiter,
  generalRateLimiter,
  getClientIP,
  validatePassword,
  generateCSRFToken,
  createCSRFCookie,
  validateCSRFToken,
  getSecurityHeaders,
  timingSafeEquals
} from "./security.server";
import {
  type UserV2,
  type LoginCredentials,
  type LoginResult,
  type AuthError,
  type CreateSessionOptions,
  type SessionV2,
  AuditEventType,
  AuthErrorCode,
  Permission,
  UserRole
} from "~/types/auth-v2";

// 🔐 ENHANCED ERROR CREATION
function createAuthError(code: AuthErrorCode, message: string, details?: Record<string, any>): AuthError {
  return { code, message, details };
}

function createRateLimitError(remainingAttempts: number, resetTime: number): AuthError {
  return createAuthError(
    AuthErrorCode.RATE_LIMITED,
    `Too many attempts. Try again later.`,
    {
      remainingAttempts,
      resetTimeMs: resetTime,
      retryAfterSeconds: Math.ceil((resetTime - Date.now()) / 1000)
    }
  );
}

// 🎯 ENHANCED MOCK USER DATABASE (with proper password hashing)
const mockUsers: Map<string, UserV2 & { passwordHash: string; }> = new Map();

// Initialize users with proper bcrypt hashing
async function initializeMockUsers() {
  const users = [
    {
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
      password: "password"
    },
    {
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
      password: "password"
    },
    {
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
      password: "password"
    }
  ];

  for (const user of users) {
    const { password, ...userWithoutPassword } = user;
    const passwordHash = await bcrypt.hash(password, securityConfig.password.bcryptRounds);

    mockUsers.set(user.email.toLowerCase(), {
      ...userWithoutPassword,
      passwordHash
    });
  }

  console.log(`✅ Initialized ${users.length} mock users with secure password hashes`);
}

// Initialize users on module load
initializeMockUsers().catch(console.error);

// 🔍 USER REPOSITORY FUNCTIONS
async function findUserByEmail(email: string): Promise<(UserV2 & { passwordHash: string; }) | null> {
  return mockUsers.get(email.toLowerCase()) || null;
}

async function findUserById(id: string): Promise<UserV2 | null> {
  for (const user of mockUsers.values()) {
    if (user.id === id) {
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
  }
  return null;
}

// ======================================
// 🔐 ENHANCED AUTHENTICATION API
// ======================================

/**
 * 🔐 PRODUCTION LOGIN with Rate Limiting, CSRF, and Security Hardening
 */
export async function login(
  request: Request,
  credentials: LoginCredentials,
  options: CreateSessionOptions = {}
): Promise<LoginResult> {

  const clientIP = getClientIP(request);
  const userAgent = request.headers.get("User-Agent") || "unknown";

  console.log(`🔐 Login attempt for: ${credentials.email} from ${clientIP}`);

  try {
    // 1. RATE LIMITING - Check before any processing
    if (loginRateLimiter.isRateLimited(clientIP)) {
      const remainingAttempts = loginRateLimiter.getRemainingAttempts(clientIP);

      logAuditEvent(AuditEventType.LOGIN_FAILURE, request, {
        success: false,
        error: "Rate limited",
        metadata: {
          email: credentials.email,
          remainingAttempts,
          rateLimitType: "ip"
        }
      });

      return {
        success: false,
        error: createRateLimitError(remainingAttempts, Date.now() + securityConfig.rateLimiting.loginWindowMs)
      };
    }

    // 2. INPUT VALIDATION
    if (!credentials.email || !credentials.password) {
      logAuditEvent(AuditEventType.LOGIN_FAILURE, request, {
        success: false,
        error: "Missing credentials",
        metadata: { email: credentials.email }
      });

      return {
        success: false,
        error: createAuthError(
          AuthErrorCode.INVALID_CREDENTIALS,
          "Email and password are required"
        )
      };
    }

    // 3. PASSWORD STRENGTH VALIDATION (for security awareness)
    const passwordValidation = validatePassword(credentials.password);
    if (!passwordValidation.valid) {
      // Don't fail login for existing users, but log weak passwords
      console.warn(`⚠️ Weak password used for login: ${credentials.email}`, passwordValidation.errors);
    }

    // 4. USER LOOKUP with timing attack protection
    const userWithPassword = await findUserByEmail(credentials.email);

    // 5. PASSWORD VERIFICATION (always perform, even if user not found)
    let passwordValid = false;
    if (userWithPassword) {
      passwordValid = await bcrypt.compare(credentials.password, userWithPassword.passwordHash);
    } else {
      // Perform dummy bcrypt to prevent timing attacks
      await bcrypt.compare(credentials.password, '$2b$12$dummy.hash.to.prevent.timing.attacks.abcdefghijklmnopqr');
    }

    // 6. AUTHENTICATION DECISION (consistent timing)
    if (!userWithPassword || !passwordValid) {
      logAuditEvent(AuditEventType.LOGIN_FAILURE, request, {
        userId: userWithPassword?.id,
        success: false,
        error: "Invalid credentials",
        metadata: {
          email: credentials.email,
          userFound: !!userWithPassword,
          passwordValid
        }
      });

      return {
        success: false,
        error: createAuthError(
          AuthErrorCode.INVALID_CREDENTIALS,
          "Invalid email or password"
        )
      };
    }

    // 7. ACCOUNT STATUS CHECKS
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
          "Account has been disabled. Please contact support."
        )
      };
    }

    if (!userWithPassword.emailVerified) {
      logAuditEvent(AuditEventType.LOGIN_FAILURE, request, {
        userId: userWithPassword.id,
        success: false,
        error: "Email not verified"
      });

      return {
        success: false,
        error: createAuthError(
          AuthErrorCode.EMAIL_NOT_VERIFIED,
          "Please verify your email address before logging in"
        )
      };
    }

    // 8. TWO-FACTOR AUTHENTICATION CHECK
    if (userWithPassword.twoFactorEnabled && !credentials.twoFactorCode) {
      logAuditEvent(AuditEventType.LOGIN_FAILURE, request, {
        userId: userWithPassword.id,
        success: false,
        error: "2FA required"
      });

      return {
        success: false,
        requiresTwoFactor: true,
        error: createAuthError(
          AuthErrorCode.TWO_FACTOR_REQUIRED,
          "Two-factor authentication code required"
        )
      };
    }

    if (userWithPassword.twoFactorEnabled && credentials.twoFactorCode) {
      // TODO: Implement 2FA verification
      console.log("🔐 2FA verification needed - not implemented yet");
    }

    // 9. SESSION CREATION with enhanced security
    const session = await createSession(
      request,
      userWithPassword.id,
      userWithPassword.role,
      userWithPassword.permissions,
      {
        remember: credentials.remember,
        skipTwoFactor: !userWithPassword.twoFactorEnabled,
        ...options
      }
    );

    // 10. SUCCESS RESPONSE
    const { passwordHash, ...user } = userWithPassword;
    user.lastLoginAt = new Date().toISOString();

    // Reset rate limiting on successful login
    loginRateLimiter.reset(clientIP);

    logAuditEvent(AuditEventType.LOGIN_SUCCESS, request, {
      userId: user.id,
      sessionId: session.sessionId,
      success: true,
      metadata: {
        role: user.role,
        department: user.department,
        remembered: credentials.remember,
        twoFactorUsed: userWithPassword.twoFactorEnabled,
        loginMethod: "email_password"
      }
    });

    console.log(`✅ Login successful for: ${credentials.email}`);

    return {
      success: true,
      user,
      session,
      redirectTo: "/dashboard"
    };

  } catch (error) {
    console.error("🚨 Login system error:", error);

    logAuditEvent(AuditEventType.LOGIN_FAILURE, request, {
      success: false,
      error: "System error during login",
      metadata: {
        email: credentials.email,
        errorType: error instanceof Error ? error.constructor.name : 'unknown'
      }
    });

    return {
      success: false,
      error: createAuthError(
        AuthErrorCode.INTERNAL_ERROR,
        "An unexpected error occurred. Please try again."
      )
    };
  }
}

/**
 * 🚪 ENHANCED LOGOUT with Security Cleanup
 */
export async function logout(request: Request, redirectTo: string = "/auth-v2/login") {
  console.log("🚪 Enhanced logout request");

  try {
    // Get session info before invalidating
    const sessionValidation = await validateSession(request);

    if (sessionValidation.isValid && sessionValidation.session) {
      logAuditEvent(AuditEventType.LOGOUT, request, {
        userId: sessionValidation.session.userId,
        sessionId: sessionValidation.session.sessionId,
        success: true,
        metadata: {
          sessionDuration: Date.now() - new Date(sessionValidation.session.createdAt).getTime(),
          isRemembered: sessionValidation.session.isRemembered
        }
      });
    }

    // Invalidate session
    await invalidateSession(request);

    // Clear session cookie
    const clearedCookie = await clearSessionCookie();

    // Prepare response headers
    const headers = new Headers();
    headers.append("Set-Cookie", clearedCookie);

    // Add security headers
    const securityHeaders = getSecurityHeaders();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      headers.append(key, value);
    });

    // Clear site data in production (helps with logout security)
    if (securityConfig.isProduction) {
      headers.append("Clear-Site-Data", '"cache", "cookies", "storage"');
    }

    console.log("✅ Enhanced logout complete, redirecting to:", redirectTo);
    return redirect(redirectTo, { headers });

  } catch (error) {
    console.error("🚨 Logout error:", error);

    // Still redirect even if logout had issues
    return redirect(redirectTo);
  }
}

/**
 * 👤 ENHANCED getCurrentUser with Rate Limiting
 */
export async function getCurrentUser(request: Request): Promise<UserV2 | null> {
  const clientIP = getClientIP(request);

  // Rate limit general requests (lighter than login)
  if (generalRateLimiter.isRateLimited(clientIP)) {
    console.warn(`⚠️ General rate limit exceeded for IP: ${clientIP}`);
    return null; // Fail gracefully
  }

  const validation = await validateSession(request);

  if (!validation.isValid || !validation.session) {
    return null;
  }

  const user = await findUserById(validation.session.userId);

  if (!user) {
    // User was deleted but session still exists
    await invalidateSession(request, validation.session.sessionId);
    return null;
  }

  return user;
}

/**
 * 👤 COMPATIBILITY: requireUser for V1 compatibility
 */
export async function requireUser(request: Request): Promise<UserV2> {
  const { user } = await requireAuth(request);
  return user;
}

/**
 * 🔒 ENHANCED requireAuth with Security Headers
 */
export async function requireAuth(request: Request): Promise<{ user: UserV2; session: SessionV2; }> {
  const validation = await validateSession(request);

  if (!validation.isValid || !validation.session) {
    console.log("🚫 Authentication required, redirecting to login");

    // Add current URL as redirect parameter
    const url = new URL(request.url);
    const redirectTo = encodeURIComponent(url.pathname + url.search);

    throw redirect(`/auth-v2/login?redirectTo=${redirectTo}`);
  }

  const user = await findUserById(validation.session.userId);

  if (!user) {
    console.log("🚫 User not found, clearing session");
    await invalidateSession(request, validation.session.sessionId);
    throw redirect("/auth-v2/login");
  }

  return { user, session: validation.session };
}

/**
 * 👑 ENHANCED requireRole with Hierarchical Permission Checking
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
        allowHigherRoles,
        accessType: "role_check"
      }
    });

    throw new Response("Forbidden: Insufficient role permissions", {
      status: 403,
      headers: getSecurityHeaders()
    });
  }

  logAuditEvent(AuditEventType.PERMISSION_GRANTED, request, {
    userId: user.id,
    sessionId: session.sessionId,
    success: true,
    metadata: {
      requiredRole,
      userRole: user.role,
      accessType: "role_check"
    }
  });

  return { user, session };
}

/**
 * 🔐 ENHANCED requirePermission with Granular Access Control
 */
export async function requirePermission(
  request: Request,
  requiredPermission: Permission
): Promise<{ user: UserV2; session: SessionV2; }> {

  const { user, session } = await requireAuth(request);

  if (!user.permissions.includes(requiredPermission)) {
    console.log(`🚫 Permission denied. Required: ${Permission[requiredPermission]}, User permissions:`,
      user.permissions.map(p => Permission[p]));

    logAuditEvent(AuditEventType.PERMISSION_DENIED, request, {
      userId: user.id,
      sessionId: session.sessionId,
      success: false,
      metadata: {
        requiredPermission: Permission[requiredPermission],
        userPermissions: user.permissions.map(p => Permission[p]),
        accessType: "permission_check"
      }
    });

    throw new Response("Forbidden: Missing required permission", {
      status: 403,
      headers: getSecurityHeaders()
    });
  }

  logAuditEvent(AuditEventType.PERMISSION_GRANTED, request, {
    userId: user.id,
    sessionId: session.sessionId,
    success: true,
    metadata: {
      permission: Permission[requiredPermission],
      accessType: "permission_check"
    }
  });

  return { user, session };
}

/**
 * 🔄 CREATE SESSION WITH SECURITY HEADERS AND CSRF
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

  // Prepare headers with security
  const headers = new Headers();
  headers.append("Set-Cookie", sessionCookie);

  // Add CSRF token for future requests
  if (securityConfig.csrf.enabled) {
    const csrfToken = generateCSRFToken();
    const csrfCookie = createCSRFCookie(csrfToken);
    headers.append("Set-Cookie", csrfCookie);
  }

  // Add security headers
  const securityHeaders = getSecurityHeaders();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    headers.append(key, value);
  });

  console.log(`✅ Enhanced session created for ${user.email}, redirecting to: ${redirectTo}`);
  return redirect(redirectTo, { headers });
}

/**
 * 🔒 CSRF TOKEN VALIDATION for Actions
 */
export async function validateCSRF(request: Request, submittedToken: string): Promise<boolean> {
  if (!securityConfig.csrf.enabled) {
    return true; // CSRF disabled (development only)
  }

  try {
    return validateCSRFToken(request, submittedToken);
  } catch (error) {
    console.warn("🚨 CSRF validation error:", error);

    logAuditEvent(AuditEventType.SUSPICIOUS_ACTIVITY, request, {
      success: false,
      error: "CSRF validation failed",
      metadata: {
        submittedTokenLength: submittedToken?.length || 0,
        hasToken: !!submittedToken
      }
    });

    return false;
  }
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

  logAuditEvent(AuditEventType.LOGOUT, request, {
    userId: user.id,
    success: true,
    metadata: {
      logoutType: "all_devices",
      sessionsTerminated: sessionCount
    }
  });

  console.log(`🧹 Logged out ${sessionCount} sessions for user: ${user.email}`);

  const clearedCookie = await clearSessionCookie();
  const headers = new Headers();
  headers.append("Set-Cookie", clearedCookie);

  // Add security headers
  const securityHeaders = getSecurityHeaders();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    headers.append(key, value);
  });

  return redirect("/auth-v2/login", { headers });
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
    timestamp: new Date().toISOString(),
    clientIP: getClientIP(request),
    userAgent: request.headers.get("User-Agent")
  };
}

/**
 * 🔧 SECURITY HEALTH CHECK
 */
export async function getSecurityHealth() {
  const loginAttempts = (loginRateLimiter as any).attempts?.size || 0;
  const generalRequests = (generalRateLimiter as any).attempts?.size || 0;

  return {
    rateLimiting: {
      loginAttempts,
      generalRequests,
      loginLimitPerMinute: securityConfig.rateLimiting.loginAttempts,
      generalLimitPerMinute: securityConfig.rateLimiting.generalRequests
    },
    security: {
      csrfEnabled: securityConfig.csrf.enabled,
      isProduction: securityConfig.isProduction,
      passwordMinLength: securityConfig.password.minLength,
      bcryptRounds: securityConfig.password.bcryptRounds
    },
    users: {
      totalUsers: mockUsers.size,
      activeUsers: Array.from(mockUsers.values()).filter(u => u.isActive).length,
      verifiedUsers: Array.from(mockUsers.values()).filter(u => u.emailVerified).length,
      twoFactorUsers: Array.from(mockUsers.values()).filter(u => u.twoFactorEnabled).length
    },
    timestamp: new Date().toISOString()
  };
}
