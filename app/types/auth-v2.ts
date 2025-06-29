// types/auth-v2.ts - Production-Ready Auth System Types

/**
 * 🎯 USER ROLES - Who the user is
 * - GUEST: Not logged in, can only browse
 * - USER: Regular customer, can shop and manage account  
 * - MANAGER: Employee, can manage products and view reports
 * - ADMIN: Full access, can manage users and system settings
 */
export enum UserRole {
  GUEST = "guest",
  USER = "user",
  MANAGER = "manager",
  ADMIN = "admin"
}

/**
 * 🔐 PERMISSIONS - What actions they can perform
 * Basic permissions apply to user's own data
 * Management permissions apply to other users' data
 */
export enum Permission {
  READ,
  WRITE,
  DELETE,
  MANAGE_USERS,
  VIEW_USERS,
  EDIT_USERS,
  MANAGE_PRODUCTS,
  VIEW_PRODUCTS,
  EDIT_PRODUCTS,
  VIEW_ANALYTICS,
  EXPORT_DATA,
  SYSTEM_ADMIN,
  MANAGE_SETTINGS,
  MANAGE_ORDERS,
  PROCESS_PAYMENTS,
  MANAGE_INVENTORY
}

// 🎯 ROLE-PERMISSION MAPPING
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.GUEST]: [
    Permission.READ
  ],
  [UserRole.USER]: [
    Permission.READ,
    Permission.WRITE
  ],
  [UserRole.MANAGER]: [
    Permission.READ,
    Permission.WRITE,
    Permission.DELETE,
    Permission.VIEW_USERS,
    Permission.VIEW_PRODUCTS,
    Permission.EDIT_PRODUCTS,
    Permission.VIEW_ANALYTICS,
    Permission.MANAGE_ORDERS
  ],
  [UserRole.ADMIN]: [
    // All permissions
    ...Object.values(Permission).filter( //TODO refactor this one
      (v): v is Permission => typeof v === "number"
    )
  ]
};

// 🎯 USER INTERFACES
export interface UserV2 {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: Permission[];
  department?: string;
  isActive: boolean;
  emailVerified: boolean;
  twoFactorEnabled: boolean;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;

  // Profile data
  avatar?: string;
  phone?: string;
  timezone?: string;
  locale?: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  department?: string;
  permissions?: Permission[];
}

export interface UpdateUserData {
  id: string;
  email?: string;
  name?: string;
  role?: UserRole;
  department?: string;
  permissions?: Permission[];
  isActive?: boolean;
}

// 🎯 SESSION INTERFACES
export interface SessionV2 {
  // Core identity
  userId: string;
  sessionId: string;
  role: UserRole;
  permissions: Permission[];

  // Security & audit
  createdAt: string;
  expiresAt: string;
  lastActivity: string;
  ipAddress: string;
  userAgent: string;
  deviceFingerprint: string;

  // Business logic
  cartId: string;              // 🔒 Signed cart reference
  department?: string;

  // Session management
  isRemembered: boolean;
  requiresPasswordChange: boolean;
  twoFactorVerified: boolean;

  // Security flags
  isElevated: boolean;         // For sensitive operations
  elevatedUntil?: string;      // Temporary elevation expiry
}

export interface CreateSessionOptions {
  remember?: boolean;
  skipTwoFactor?: boolean;
  elevatePermissions?: boolean;
  customExpiry?: number;       // Minutes
}

export interface SessionValidationResult {
  isValid: boolean;
  session?: SessionV2;
  reason?: SessionInvalidReason;
}

export enum SessionInvalidReason {
  NOT_FOUND = "not_found",
  EXPIRED = "expired",
  TAMPERED = "tampered",
  IP_MISMATCH = "ip_mismatch",
  DEVICE_MISMATCH = "device_mismatch",
  REQUIRES_2FA = "requires_2fa",
  PASSWORD_CHANGE_REQUIRED = "password_change_required"
}

// 🎯 AUTHENTICATION INTERFACES
export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
  twoFactorCode?: string;
}

export interface LoginResult {
  success: boolean;
  user?: UserV2;
  session?: SessionV2;
  redirectTo?: string;
  error?: AuthError;
  requiresTwoFactor?: boolean;
}

export interface AuthError {
  code: AuthErrorCode;
  message: string;
  details?: Record<string, any>;
}

export enum AuthErrorCode {
  INVALID_CREDENTIALS = "invalid_credentials",
  ACCOUNT_LOCKED = "account_locked",
  ACCOUNT_DISABLED = "account_disabled",
  EMAIL_NOT_VERIFIED = "email_not_verified",
  TWO_FACTOR_REQUIRED = "two_factor_required",
  TWO_FACTOR_INVALID = "two_factor_invalid",
  PASSWORD_EXPIRED = "password_expired",
  SESSION_EXPIRED = "session_expired",
  PERMISSION_DENIED = "permission_denied",
  RATE_LIMITED = "rate_limited",
  INTERNAL_ERROR = "internal_error"
}

// 🎯 CART INTERFACES (Secure)
export interface SecureCart {
  id: string;                  // Signed, tamper-proof ID
  userId?: string;             // Null for guest carts
  sessionId: string;           // Links cart to session
  items: CartItem[];
  total: number;
  itemCount: number;
  currency: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;          // Guest cart expiry

  // Security
  checksum: string;            // Verify cart integrity
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  maxQuantity: number;         // Stock limit
  image: string;
  category: string;

  // Metadata
  addedAt: string;
  updatedAt: string;
}

export interface CartOperation {
  type: 'add' | 'update' | 'remove' | 'clear';
  productId?: string;
  quantity?: number;
  timestamp: string;
}

// 🎯 PERMISSION CHECK INTERFACES
export interface PermissionContext {
  user: UserV2;
  resource?: string;           // What they're trying to access
  action?: string;             // What they're trying to do
  metadata?: Record<string, any>;
}

export interface PermissionResult {
  allowed: boolean;
  reason?: string;
  requiredRole?: UserRole;
  requiredPermissions?: Permission[];
}

// 🎯 AUDIT & LOGGING INTERFACES
export interface AuditEvent {
  id: string;
  type: AuditEventType;
  userId?: string;
  sessionId?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;

  // Event details
  resource?: string;
  action?: string;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export enum AuditEventType {
  // Authentication
  LOGIN_ATTEMPT = "login_attempt",
  LOGIN_SUCCESS = "login_success",
  LOGIN_FAILURE = "login_failure",
  LOGOUT = "logout",
  SESSION_EXPIRED = "session_expired",

  // Authorization
  PERMISSION_GRANTED = "permission_granted",
  PERMISSION_DENIED = "permission_denied",
  ROLE_CHANGED = "role_changed",

  // Security
  COOKIE_TAMPERED = "cookie_tampered",
  SUSPICIOUS_ACTIVITY = "suspicious_activity",
  PASSWORD_CHANGED = "password_changed",
  TWO_FACTOR_ENABLED = "two_factor_enabled",

  // Business operations
  CART_MODIFIED = "cart_modified",
  ORDER_PLACED = "order_placed",
  USER_CREATED = "user_created",
  USER_UPDATED = "user_updated"
}

// 🎯 CONFIGURATION INTERFACES
export interface AuthV2Config {
  // Cookie settings
  cookieSecret: string;
  cookieName: string;
  cookieMaxAge: number;        // Seconds

  // Session settings
  sessionTimeout: number;      // Minutes
  rememberMeTimeout: number;   // Days
  maxConcurrentSessions: number;

  // Security settings
  requireTwoFactor: boolean;
  passwordMinLength: number;
  passwordRequireSymbols: boolean;
  maxLoginAttempts: number;
  lockoutDuration: number;     // Minutes

  // Environment
  isProduction: boolean;
  allowInsecureCookies: boolean;
  enableAuditLogging: boolean;
}

// 🎯 DATABASE INTERFACES (Future)
export interface UserRepository {
  findById(id: string): Promise<UserV2 | null>;
  findByEmail(email: string): Promise<UserV2 | null>;
  create(data: CreateUserData): Promise<UserV2>;
  update(data: UpdateUserData): Promise<UserV2>;
  delete(id: string): Promise<boolean>;
  list(filters?: any): Promise<UserV2[]>;
}

export interface SessionRepository {
  create(session: SessionV2): Promise<void>;
  findById(sessionId: string): Promise<SessionV2 | null>;
  findByUserId(userId: string): Promise<SessionV2[]>;
  update(sessionId: string, data: Partial<SessionV2>): Promise<void>;
  delete(sessionId: string): Promise<void>;
  cleanup(): Promise<number>; // Returns number of cleaned sessions
}

export interface CartRepository {
  findBySessionId(sessionId: string): Promise<SecureCart | null>;
  create(cart: SecureCart): Promise<void>;
  update(cartId: string, cart: SecureCart): Promise<void>;
  delete(cartId: string): Promise<void>;
  transferOwnership(cartId: string, newUserId: string): Promise<void>;
}

// 🎯 UTILITY TYPES
export type AuthMiddleware = (request: Request) => Promise<{
  user?: UserV2;
  session?: SessionV2;
  error?: AuthError;
}>;

export type PermissionGuard = (
  requiredPermissions: Permission[],
  context?: Partial<PermissionContext>
) => AuthMiddleware;

export type RoleGuard = (
  requiredRole: UserRole,
  allowHigherRoles?: boolean
) => AuthMiddleware;
