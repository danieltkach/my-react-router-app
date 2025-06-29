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
    csp: process.env.CSP_POLICY || "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self';",
  }
} as const;

// 🛡️ ADVANCED RATE LIMITING IMPLEMENTATION
interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstAttempt: number;
  lastAttempt: number;
}

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number; // How long to block after limit exceeded
}

class AdvancedRateLimiter {
  private attempts = new Map<string, RateLimitEntry>();
  private blacklist = new Map<string, number>(); // IP -> unblock time

  constructor(
    private config: RateLimitConfig
  ) { }

  isRateLimited(identifier: string): boolean {
    const now = Date.now();

    // Check if identifier is blacklisted
    const blacklistUntil = this.blacklist.get(identifier);
    if (blacklistUntil && now < blacklistUntil) {
      console.warn(`🚫 Identifier ${identifier} is blacklisted until ${new Date(blacklistUntil).toISOString()}`);
      return true;
    }

    // Remove from blacklist if expired
    if (blacklistUntil && now >= blacklistUntil) {
      this.blacklist.delete(identifier);
    }

    const entry = this.attempts.get(identifier);

    if (!entry || now > entry.resetTime) {
      // Reset or create new entry
      this.attempts.set(identifier, {
        count: 1,
        resetTime: now + this.config.windowMs,
        firstAttempt: now,
        lastAttempt: now
      });
      return false;
    }

    if (entry.count >= this.config.maxAttempts) {
      // Add to blacklist if configured
      if (this.config.blockDurationMs) {
        this.blacklist.set(identifier, now + this.config.blockDurationMs);
        console.warn(`🚫 Rate limit exceeded for ${identifier}, blacklisted for ${this.config.blockDurationMs}ms`);
      }
      return true;
    }

    entry.count++;
    entry.lastAttempt = now;
    return false;
  }

  getRemainingAttempts(identifier: string): number {
    const entry = this.attempts.get(identifier);
    if (!entry || Date.now() > entry.resetTime) {
      return this.config.maxAttempts;
    }
    return Math.max(0, this.config.maxAttempts - entry.count);
  }

  getTimeUntilReset(identifier: string): number {
    const entry = this.attempts.get(identifier);
    if (!entry) return 0;
    return Math.max(0, entry.resetTime - Date.now());
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
    this.blacklist.delete(identifier);
    console.log(`✅ Rate limit reset for ${identifier}`);
  }

  // Get attempt statistics for monitoring
  getStats(identifier: string): { attempts: number; firstAttempt: Date; lastAttempt: Date; resetTime: Date; } | null {
    const entry = this.attempts.get(identifier);
    if (!entry) return null;

    return {
      attempts: entry.count,
      firstAttempt: new Date(entry.firstAttempt),
      lastAttempt: new Date(entry.lastAttempt),
      resetTime: new Date(entry.resetTime)
    };
  }

  // Clean up expired entries (call periodically)
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    // Clean attempts
    for (const [key, entry] of this.attempts.entries()) {
      if (now > entry.resetTime) {
        this.attempts.delete(key);
        cleaned++;
      }
    }

    // Clean blacklist
    for (const [key, unblockTime] of this.blacklist.entries()) {
      if (now >= unblockTime) {
        this.blacklist.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  // Get all active limits (for monitoring dashboard)
  getActiveLimits(): Array<{ identifier: string; attempts: number; resetIn: number; isBlacklisted: boolean; }> {
    const now = Date.now();
    const results = [];

    for (const [identifier, entry] of this.attempts.entries()) {
      if (now <= entry.resetTime) {
        results.push({
          identifier: identifier.substring(0, 8) + '...', // Mask for privacy
          attempts: entry.count,
          resetIn: entry.resetTime - now,
          isBlacklisted: this.blacklist.has(identifier)
        });
      }
    }

    return results;
  }
}

// Rate limiter instances with enhanced configurations
export const loginRateLimiter = new AdvancedRateLimiter({
  maxAttempts: securityConfig.rateLimiting.loginAttempts,
  windowMs: securityConfig.rateLimiting.loginWindowMs,
  blockDurationMs: 60 * 60 * 1000 // 1 hour block after exceeding limit
});

export const generalRateLimiter = new AdvancedRateLimiter({
  maxAttempts: securityConfig.rateLimiting.generalRequests,
  windowMs: securityConfig.rateLimiting.generalWindowMs,
  blockDurationMs: 15 * 60 * 1000 // 15 minute block
});

// 🛡️ CSRF PROTECTION
export function generateCSRFToken(): string {
  return crypto.randomBytes(securityConfig.csrf.tokenLength).toString('hex');
}

export function createCSRFCookie(token: string): string {
  const isSecure = securityConfig.isProduction;
  const maxAge = 3600; // 1 hour

  return `${securityConfig.csrf.cookieName}=${token}; Path=/; HttpOnly; SameSite=Strict${isSecure ? '; Secure' : ''}; Max-Age=${maxAge}`;
}

export function validateCSRFToken(request: Request, submittedToken: string): boolean {
  if (!securityConfig.csrf.enabled) {
    return true; // CSRF disabled (development only)
  }

  if (!submittedToken || submittedToken.length !== securityConfig.csrf.tokenLength * 2) {
    console.warn("🚨 CSRF validation failed: Invalid token format");
    return false;
  }

  // Get token from cookie
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(cookie => {
      const [key, value] = cookie.trim().split('=');
      return [key, value];
    }).filter(([key, value]) => key && value)
  );

  const storedToken = cookies[securityConfig.csrf.cookieName];

  if (!storedToken) {
    console.warn("🚨 CSRF validation failed: No stored token found");
    return false;
  }

  if (storedToken.length !== submittedToken.length) {
    console.warn("🚨 CSRF validation failed: Token length mismatch");
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(storedToken, 'hex'),
      Buffer.from(submittedToken, 'hex')
    );
  } catch (error) {
    console.warn("🚨 CSRF validation failed: Token comparison error", error);
    return false;
  }
}

// 🛡️ COMPREHENSIVE SECURITY HEADERS
export function getSecurityHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    // Content Security Policy - Prevent XSS and injection attacks
    'Content-Security-Policy': securityConfig.headers.csp,

    // Prevent MIME sniffing attacks
    'X-Content-Type-Options': 'nosniff',

    // Prevent clickjacking attacks
    'X-Frame-Options': 'DENY',

    // XSS protection (legacy but still useful)
    'X-XSS-Protection': '1; mode=block',

    // Control referrer information
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Permissions policy (restrict dangerous features)
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), bluetooth=(), magnetometer=(), gyroscope=()',

    // Remove server information
    'Server': 'React Router Application',

    // CORS (if needed)
    'X-Permitted-Cross-Domain-Policies': 'none',

    // DNS prefetch control
    'X-DNS-Prefetch-Control': 'off',

    // Expect-CT (Certificate Transparency)
    'Expect-CT': 'max-age=86400, enforce',
  };

  // HSTS only for HTTPS in production
  if (securityConfig.isProduction) {
    headers['Strict-Transport-Security'] = `max-age=${securityConfig.headers.hsts}; includeSubDomains; preload`;
  }

  return headers;
}

// 🛡️ IP ADDRESS EXTRACTION (for rate limiting and audit)
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

  // Fallback to connection info if available
  // Note: This might not be available in all environments
  return 'unknown';
}

function isValidIP(ip: string): boolean {
  // Basic IP validation (IPv4 and IPv6)
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  if (ipv4Regex.test(ip)) {
    // Additional validation for IPv4 private ranges if needed
    return true;
  }

  return ipv6Regex.test(ip);
}

// 🛡️ ENHANCED PASSWORD VALIDATION
export function validatePassword(password: string): { valid: boolean; errors: string[]; score: number; } {
  const errors: string[] = [];
  const config = securityConfig.password;
  let score = 0;

  if (password.length < config.minLength) {
    errors.push(`Password must be at least ${config.minLength} characters long`);
  } else {
    score += Math.min(2, password.length / 4); // Up to 2 points for length
  }

  if (config.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else if (/[A-Z]/.test(password)) {
    score += 1;
  }

  if (config.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else if (/[a-z]/.test(password)) {
    score += 1;
  }

  if (config.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  } else if (/\d/.test(password)) {
    score += 1;
  }

  if (config.requireSymbols && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  } else if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  }

  // Additional security checks
  if (password.toLowerCase().includes('password')) {
    errors.push('Password cannot contain the word "password"');
    score -= 2;
  }

  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password cannot contain repeated characters');
    score -= 1;
  }

  // Common patterns
  if (/123456|abcdef|qwerty|admin|root/.test(password.toLowerCase())) {
    errors.push('Password cannot contain common patterns');
    score -= 2;
  }

  return {
    valid: errors.length === 0,
    errors,
    score: Math.max(0, Math.min(10, score)) // Normalize to 0-10
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

  try {
    return crypto.timingSafeEqual(
      Buffer.from(a, 'utf8'),
      Buffer.from(b, 'utf8')
    );
  } catch (error) {
    console.warn("Timing-safe comparison failed:", error);
    return false;
  }
}

// 🛡️ INPUT SANITIZATION
export function sanitizeInput(input: string, maxLength: number = 1000): string {
  if (!input) return '';

  return input
    .slice(0, maxLength)
    .replace(/[<>\"'&]/g, (char) => {
      const map: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return map[char] || char;
    });
}

// 🛡️ EMAIL VALIDATION
export function validateEmail(email: string): { valid: boolean; errors: string[]; } {
  const errors: string[] = [];

  if (!email) {
    errors.push('Email is required');
    return { valid: false, errors };
  }

  if (email.length > 254) {
    errors.push('Email is too long');
  }

  // Basic email regex (RFC 5322 compliant)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(email)) {
    errors.push('Invalid email format');
  }

  // Check for common typos
  const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  const domain = email.split('@')[1];

  if (domain && !commonDomains.includes(domain.toLowerCase())) {
    // This is just a warning, not an error
    console.log(`📧 Uncommon email domain: ${domain}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// 🧹 PERIODIC CLEANUP (call from background job)
export function performSecurityCleanup(): {
  loginEntries: number;
  generalEntries: number;
  totalCleaned: number;
  timestamp: string;
} {
  const loginCleaned = loginRateLimiter.cleanup();
  const generalCleaned = generalRateLimiter.cleanup();
  const totalCleaned = loginCleaned + generalCleaned;

  console.log(`🧹 Security cleanup: ${loginCleaned} login entries, ${generalCleaned} general entries removed`);

  return {
    loginEntries: loginCleaned,
    generalEntries: generalCleaned,
    totalCleaned,
    timestamp: new Date().toISOString()
  };
}

// 🔍 SECURITY MONITORING & METRICS
export function getSecurityMetrics() {
  return {
    rateLimiting: {
      loginAttempts: (loginRateLimiter as any).attempts?.size || 0,
      generalRequests: (generalRateLimiter as any).attempts?.size || 0,
      activeLoginLimits: loginRateLimiter.getActiveLimits(),
      activeGeneralLimits: generalRateLimiter.getActiveLimits(),
    },
    configuration: {
      isProduction: securityConfig.isProduction,
      csrfEnabled: securityConfig.csrf.enabled,
      maxConcurrentSessions: securityConfig.session.maxConcurrentSessions,
      passwordRequirements: {
        minLength: securityConfig.password.minLength,
        requireUppercase: securityConfig.password.requireUppercase,
        requireNumbers: securityConfig.password.requireNumbers,
        requireSymbols: securityConfig.password.requireSymbols,
        bcryptRounds: securityConfig.password.bcryptRounds
      },
      rateLimits: {
        loginAttempts: securityConfig.rateLimiting.loginAttempts,
        loginWindow: securityConfig.rateLimiting.loginWindowMs,
        generalRequests: securityConfig.rateLimiting.generalRequests,
        generalWindow: securityConfig.rateLimiting.generalWindowMs
      }
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      cookieSecretLength: securityConfig.cookieSecret.length,
    },
    timestamp: new Date().toISOString()
  };
}

// 🔒 SECURITY AUDIT LOG HELPER
export function createSecurityEvent(
  type: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  details: Record<string, any>
) {
  return {
    id: generateSecureId('sec-'),
    type,
    severity,
    timestamp: new Date().toISOString(),
    details,
    environment: process.env.NODE_ENV
  };
}

// 🛡️ THREAT DETECTION
export function detectSuspiciousActivity(request: Request): {
  suspicious: boolean;
  reasons: string[];
  riskScore: number;
} {
  const reasons: string[] = [];
  let riskScore = 0;

  const userAgent = request.headers.get('User-Agent') || '';
  const ip = getClientIP(request);

  // Check for suspicious user agents
  if (!userAgent || userAgent.length < 10) {
    reasons.push('Missing or short User-Agent');
    riskScore += 3;
  }

  if (/bot|crawler|spider|scraper/i.test(userAgent)) {
    reasons.push('Bot-like User-Agent detected');
    riskScore += 2;
  }

  // Check for suspicious IPs (basic examples)
  if (ip === 'unknown') {
    reasons.push('IP address could not be determined');
    riskScore += 1;
  }

  // Check for common attack patterns in headers
  const suspiciousHeaders = ['x-forwarded-host', 'x-originating-ip', 'x-remote-ip'];
  for (const header of suspiciousHeaders) {
    if (request.headers.get(header)) {
      reasons.push(`Suspicious header present: ${header}`);
      riskScore += 1;
    }
  }

  // Check request frequency from rate limiter
  const loginStats = loginRateLimiter.getStats(ip);
  if (loginStats && loginStats.attempts > 3) {
    reasons.push('High login attempt frequency');
    riskScore += 2;
  }

  return {
    suspicious: riskScore >= 3,
    reasons,
    riskScore
  };
}
