// lib/security.server.ts - Production Security Configuration
import crypto from "crypto";

// 🔐 ENVIRONMENT VALIDATION (Critical for Production)
function validateEnvironment() {
  const requiredEnvVars = [
    'COOKIE_SECRET',
    'NODE_ENV'
  ];

  const missing = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate cookie secret strength
  const cookieSecret = process.env.COOKIE_SECRET!;
  if (cookieSecret.length < 32) {
    throw new Error('COOKIE_SECRET must be at least 32 characters for production security');
  }

  // Warn about development defaults
  if (cookieSecret === 'dev-secret-change-in-production') {
    throw new Error('COOKIE_SECRET must be changed from default value in production');
  }

  console.log('✅ Environment validation passed');
}

// Call this immediately when server starts
validateEnvironment();

// 🛡️ SECURITY CONFIGURATION
export const securityConfig = {
  // Environment
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',

  // Secrets (validated above)
  cookieSecret: process.env.COOKIE_SECRET!,

  // Rate limiting
  rateLimiting: {
    loginAttempts: parseInt(process.env.RATE_LIMIT_LOGIN_ATTEMPTS || '5'),
    loginWindowMs: parseInt(process.env.RATE_LIMIT_LOGIN_WINDOW || '300000'), // 5 minutes
    generalRequests: parseInt(process.env.RATE_LIMIT_GENERAL || '100'),
    generalWindowMs: parseInt(process.env.RATE_LIMIT_GENERAL_WINDOW || '900000'), // 15 minutes
  },

  // Session security
  session: {
    maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400'), // 24 hours
    rememberMeMaxAge: parseInt(process.env.REMEMBER_ME_MAX_AGE || '2592000'), // 30 days
    maxConcurrentSessions: parseInt(process.env.MAX_CONCURRENT_SESSIONS || '5'),
    rotateInterval: parseInt(process.env.SESSION_ROTATE_INTERVAL || '3600'), // 1 hour
  },

  // Password requirements
  password: {
    minLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '8'),
    requireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE !== 'false',
    requireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE !== 'false',
    requireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS !== 'false',
    requireSymbols: process.env.PASSWORD_REQUIRE_SYMBOLS !== 'false',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
  },

  // CSRF protection
  csrf: {
    enabled: process.env.CSRF_PROTECTION !== 'false',
    tokenLength: 32,
    cookieName: '__Host-csrf-token',
  },

  // Security headers
  headers: {
    hsts: process.env.HSTS_MAX_AGE || '31536000', // 1 year
    csp: process.env.CSP_POLICY || "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
  }
} as const;

// 🛡️ RATE LIMITING IMPLEMENTATION
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private attempts = new Map<string, RateLimitEntry>();

  constructor(
    private maxAttempts: number,
    private windowMs: number
  ) { }

  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const entry = this.attempts.get(identifier);

    if (!entry || now > entry.resetTime) {
      // Reset or create new entry
      this.attempts.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return false;
    }

    if (entry.count >= this.maxAttempts) {
      return true;
    }

    entry.count++;
    return false;
  }

  getRemainingAttempts(identifier: string): number {
    const entry = this.attempts.get(identifier);
    if (!entry || Date.now() > entry.resetTime) {
      return this.maxAttempts;
    }
    return Math.max(0, this.maxAttempts - entry.count);
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }

  // Clean up expired entries (call periodically)
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.attempts.entries()) {
      if (now > entry.resetTime) {
        this.attempts.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }
}

// Rate limiter instances
export const loginRateLimiter = new RateLimiter(
  securityConfig.rateLimiting.loginAttempts,
  securityConfig.rateLimiting.loginWindowMs
);

export const generalRateLimiter = new RateLimiter(
  securityConfig.rateLimiting.generalRequests,
  securityConfig.rateLimiting.generalWindowMs
);

// 🛡️ CSRF PROTECTION
export function generateCSRFToken(): string {
  return crypto.randomBytes(securityConfig.csrf.tokenLength).toString('hex');
}

export function createCSRFCookie(token: string): string {
  const isSecure = securityConfig.isProduction;

  return `${securityConfig.csrf.cookieName}=${token}; Path=/; HttpOnly; SameSite=Strict${isSecure ? '; Secure' : ''}; Max-Age=3600`;
}

export function validateCSRFToken(request: Request, submittedToken: string): boolean {
  if (!securityConfig.csrf.enabled) {
    return true; // CSRF disabled (development only)
  }

  // Get token from cookie
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(cookie => {
      const [key, value] = cookie.trim().split('=');
      return [key, value];
    })
  );

  const storedToken = cookies[securityConfig.csrf.cookieName];

  if (!storedToken || !submittedToken) {
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(storedToken, 'hex'),
    Buffer.from(submittedToken, 'hex')
  );
}

// 🛡️ SECURITY HEADERS
export function getSecurityHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    // Content Security Policy
    'Content-Security-Policy': securityConfig.headers.csp,

    // Prevent MIME sniffing
    'X-Content-Type-Options': 'nosniff',

    // Prevent clickjacking
    'X-Frame-Options': 'DENY',

    // XSS protection (legacy but still useful)
    'X-XSS-Protection': '1; mode=block',

    // Referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Permissions policy (restrict dangerous features)
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), bluetooth=()',

    // Remove server information
    'Server': 'React Router Application',

    // CORS (if needed)
    'X-Permitted-Cross-Domain-Policies': 'none',
  };

  // HSTS only for HTTPS
  if (securityConfig.isProduction) {
    headers['Strict-Transport-Security'] = `max-age=${securityConfig.headers.hsts}; includeSubDomains; preload`;
  }

  return headers;
}

// 🛡️ IP ADDRESS EXTRACTION (for rate limiting)
export function getClientIP(request: Request): string {
  // Try headers in order of preference
  const headers = [
    'CF-Connecting-IP',      // Cloudflare
    'X-Forwarded-For',       // Standard proxy header
    'X-Real-IP',             // Nginx
    'X-Client-IP',           // Apache
    'X-Forwarded',           // Variation
    'Forwarded-For',         // Variation
    'Forwarded'              // RFC 7239
  ];

  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      // X-Forwarded-For can be comma-separated list, take first
      const ip = value.split(',')[0].trim();
      if (isValidIP(ip)) {
        return ip;
      }
    }
  }

  // Fallback
  return 'unknown';
}

function isValidIP(ip: string): boolean {
  // Basic IP validation (IPv4 and IPv6)
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  if (ipv4Regex.test(ip)) {
    // Validate IPv4 ranges
    const parts = ip.split('.').map(Number);
    return parts.every(part => part >= 0 && part <= 255);
  }

  return ipv6Regex.test(ip);
}

// 🛡️ PASSWORD VALIDATION
export function validatePassword(password: string): { valid: boolean; errors: string[]; } {
  const errors: string[] = [];
  const config = securityConfig.password;

  if (password.length < config.minLength) {
    errors.push(`Password must be at least ${config.minLength} characters long`);
  }

  if (config.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (config.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (config.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (config.requireSymbols && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// 🛡️ SECURE RANDOM GENERATION
export function generateSecureToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

export function generateSecureId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(8).toString('hex');
  return `${prefix}${timestamp}-${random}`;
}

// 🛡️ TIMING-SAFE COMPARISONS
export function timingSafeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(a, 'utf8'),
    Buffer.from(b, 'utf8')
  );
}

// 🧹 PERIODIC CLEANUP (call from background job)
export function performSecurityCleanup(): { loginEntries: number; generalEntries: number; } {
  const loginCleaned = loginRateLimiter.cleanup();
  const generalCleaned = generalRateLimiter.cleanup();

  console.log(`🧹 Security cleanup: ${loginCleaned} login entries, ${generalCleaned} general entries removed`);

  return {
    loginEntries: loginCleaned,
    generalEntries: generalCleaned
  };
}

// 🔍 SECURITY MONITORING
export function getSecurityMetrics() {
  return {
    rateLimiting: {
      loginAttempts: loginRateLimiter['attempts'].size,
      generalRequests: generalRateLimiter['attempts'].size,
    },
    configuration: {
      isProduction: securityConfig.isProduction,
      csrfEnabled: securityConfig.csrf.enabled,
      maxConcurrentSessions: securityConfig.session.maxConcurrentSessions,
      passwordRequirements: securityConfig.password,
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      cookieSecretLength: securityConfig.cookieSecret.length,
    }
  };
}
