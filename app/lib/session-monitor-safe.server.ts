// app/lib/session-monitor-safe.server.ts - Safe monitoring without logout issues
import crypto from "crypto";

// 🎯 Session activity tracking
interface SessionActivity {
  timestamp: string;
  action: string;
  route: string;
  ip: string;
  userAgent: string;
  details?: any;
}

interface SessionRecord {
  sessionId: string;
  userId: string;
  loginTime: string;
  lastActivity: string;
  loginIP: string;
  deviceInfo: string;
  remember: boolean;
  activities: SessionActivity[];
  isActive: boolean;
  logoutTime?: string;
  logoutReason?: string;
}

// 🎯 In-memory stores (replace with Redis/Database in production)
const activeSessions = new Map<string, SessionRecord>();
const userSessions = new Map<string, Set<string>>(); // userId -> Set of sessionIds

// 🎯 Configuration
const MAX_SESSIONS_PER_USER = 10; // Increased to allow multiple browsers
const MAX_ACTIVITIES_PER_SESSION = 50;

// 🎯 Create session record (called when user logs in)
export function createSessionRecord(
  sessionId: string,
  userId: string,
  request: Request,
  remember: boolean
): SessionRecord {
  const now = new Date().toISOString();
  const clientIP = request.headers.get("X-Forwarded-For") || request.headers.get("CF-Connecting-IP") || "unknown";
  const userAgent = request.headers.get("User-Agent") || "unknown";

  // 🔧 FIX: Create unique browser fingerprint to differentiate sessions
  const browserFingerprint = createBrowserFingerprint(request);

  const sessionRecord: SessionRecord = {
    sessionId,
    userId,
    loginTime: now,
    lastActivity: now,
    loginIP: clientIP,
    deviceInfo: userAgent.substring(0, 200),
    remember,
    activities: [{
      timestamp: now,
      action: "login",
      route: new URL(request.url).pathname,
      ip: clientIP,
      userAgent: userAgent.substring(0, 100),
      details: {
        remember,
        device: extractDeviceType(userAgent),
        browser: extractBrowserType(userAgent),
        browserFingerprint: browserFingerprint.substring(0, 8) + '...'
      }
    }],
    isActive: true
  };

  // Store session
  activeSessions.set(sessionId, sessionRecord);

  // Track by user
  if (!userSessions.has(userId)) {
    userSessions.set(userId, new Set());
  }
  userSessions.get(userId)!.add(sessionId);

  // 🔧 FIX: Don't enforce limits too aggressively - let multiple browsers work
  // Only enforce limits if we have way too many sessions
  if (userSessions.get(userId)!.size > 10) {
    enforceSessionLimits(userId);
  }

  console.log(`🎯 MONITOR: New session created for user ${userId}`, {
    sessionId: sessionId.substring(0, 8) + '...',
    ip: clientIP,
    device: extractDeviceType(userAgent),
    browser: extractBrowserType(userAgent),
    fingerprint: browserFingerprint.substring(0, 8) + '...'
  });

  return sessionRecord;
}

// 🎯 Log session activity (safe - doesn't affect session validity)
export function logSessionActivity(
  sessionId: string,
  action: string,
  request: Request,
  details?: any
) {
  const session = activeSessions.get(sessionId);
  if (!session || !session.isActive) return;

  const now = new Date().toISOString();
  const activity: SessionActivity = {
    timestamp: now,
    action,
    route: new URL(request.url).pathname,
    ip: request.headers.get("X-Forwarded-For") || request.headers.get("CF-Connecting-IP") || "unknown",
    userAgent: request.headers.get("User-Agent")?.substring(0, 100) || "unknown",
    details
  };

  // Add activity (keep only last N activities)
  session.activities.push(activity);
  if (session.activities.length > MAX_ACTIVITIES_PER_SESSION) {
    session.activities = session.activities.slice(-MAX_ACTIVITIES_PER_SESSION);
  }

  // Update last activity
  session.lastActivity = now;

  console.log(`🎯 ACTIVITY: ${action} for session ${sessionId.substring(0, 8)}...`, {
    route: activity.route,
    userId: session.userId
  });
}

// 🎯 Enforce session limits per user
function enforceSessionLimits(userId: string) {
  const userSessionIds = userSessions.get(userId);
  if (!userSessionIds || userSessionIds.size <= MAX_SESSIONS_PER_USER) {
    return;
  }

  // Get all sessions for this user, sorted by last activity
  const sessions = Array.from(userSessionIds)
    .map(id => activeSessions.get(id))
    .filter(Boolean)
    .sort((a, b) => new Date(a!.lastActivity).getTime() - new Date(b!.lastActivity).getTime());

  // Remove oldest sessions
  const sessionsToRemove = sessions.slice(0, sessions.length - MAX_SESSIONS_PER_USER);

  sessionsToRemove.forEach(session => {
    if (session) {
      terminateSession(session.sessionId, "session_limit_exceeded");
    }
  });

  console.log(`🎯 SESSION LIMIT: Terminated ${sessionsToRemove.length} old sessions for user ${userId}`);
}

// 🎯 Terminate session (doesn't affect current user - just marks as inactive)
export function terminateSession(sessionId: string, reason: string) {
  const session = activeSessions.get(sessionId);
  if (!session) return;

  session.isActive = false;
  session.logoutTime = new Date().toISOString();
  session.logoutReason = reason;

  // Remove from active tracking
  const userSessionIds = userSessions.get(session.userId);
  if (userSessionIds) {
    userSessionIds.delete(sessionId);
    if (userSessionIds.size === 0) {
      userSessions.delete(session.userId);
    }
  }

  console.log(`🎯 SESSION TERMINATED: ${sessionId.substring(0, 8)}... - Reason: ${reason}`);
}

// 🎯 Get session record
export function getSessionRecord(sessionId: string): SessionRecord | null {
  return activeSessions.get(sessionId) || null;
}

// 🎯 Get all sessions for a user
export function getUserSessions(userId: string): SessionRecord[] {
  const sessionIds = userSessions.get(userId);
  if (!sessionIds) return [];

  return Array.from(sessionIds)
    .map(id => activeSessions.get(id))
    .filter(Boolean) as SessionRecord[];
}

// 🎯 Get all active sessions (for admin)
export function getAllActiveSessions(): SessionRecord[] {
  return Array.from(activeSessions.values()).filter(s => s.isActive);
}

// 🎯 Get session analytics
export function getSessionAnalytics() {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  const allSessions = Array.from(activeSessions.values());
  const activeSessions24h = allSessions.filter(s =>
    s.isActive && new Date(s.lastActivity).getTime() > oneDayAgo
  );
  const activeSessions1h = allSessions.filter(s =>
    s.isActive && new Date(s.lastActivity).getTime() > oneHourAgo
  );

  // Activity patterns
  const totalActivities = allSessions.reduce((sum, s) => sum + s.activities.length, 0);

  // Device/IP analysis
  const uniqueIPs = new Set();
  const uniqueDevices = new Set();
  allSessions.forEach(s => {
    uniqueIPs.add(s.loginIP);
    uniqueDevices.add(extractDeviceType(s.deviceInfo));
  });

  return {
    totalSessions: allSessions.length,
    activeSessions: allSessions.filter(s => s.isActive).length,
    activeSessions24h: activeSessions24h.length,
    activeSessions1h: activeSessions1h.length,
    totalUsers: userSessions.size,
    totalActivities,
    uniqueIPs: uniqueIPs.size,
    uniqueDevices: uniqueDevices.size,
    averageSessionDuration: calculateAverageSessionDuration(allSessions),
    sessionsByDevice: groupSessionsByDevice(allSessions),
    recentActivities: getRecentActivities(20)
  };
}

// 🎯 Get recent activities across all sessions
export function getRecentActivities(limit: number = 10): SessionActivity[] {
  const allActivities: (SessionActivity & { sessionId: string, userId: string; })[] = [];

  for (const [sessionId, session] of activeSessions.entries()) {
    session.activities.forEach(activity => {
      allActivities.push({
        ...activity,
        sessionId,
        userId: session.userId
      });
    });
  }

  // Sort by timestamp and take most recent
  return allActivities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

// 🎯 Helper functions
function createBrowserFingerprint(request: Request): string {
  const userAgent = request.headers.get("User-Agent") || "";
  const acceptLanguage = request.headers.get("Accept-Language") || "";
  const acceptEncoding = request.headers.get("Accept-Encoding") || "";

  // Create a unique fingerprint for this specific browser instance
  const fingerprint = crypto
    .createHash('sha256')
    .update(userAgent + acceptLanguage + acceptEncoding + Math.random().toString())
    .digest('hex')
    .substring(0, 16);

  return fingerprint;
}

function extractBrowserType(userAgent: string): string {
  if (userAgent.includes('Chrome') && !userAgent.includes('Edge')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  return 'Unknown Browser';
}

function calculateAverageSessionDuration(sessions: SessionRecord[]): number {
  const completedSessions = sessions.filter(s => s.logoutTime);
  if (completedSessions.length === 0) return 0;

  const totalDuration = completedSessions.reduce((sum, s) => {
    const login = new Date(s.loginTime).getTime();
    const logout = new Date(s.logoutTime!).getTime();
    return sum + (logout - login);
  }, 0);

  return Math.round(totalDuration / completedSessions.length / 1000 / 60); // minutes
}

function groupSessionsByDevice(sessions: SessionRecord[]) {
  const deviceGroups: Record<string, number> = {};

  sessions.forEach(s => {
    const device = extractDeviceType(s.deviceInfo);
    deviceGroups[device] = (deviceGroups[device] || 0) + 1;
  });

  return deviceGroups;
}

function extractDeviceType(userAgent: string): string {
  if (userAgent.includes('Mobile')) return 'Mobile';
  if (userAgent.includes('Tablet') || userAgent.includes('iPad')) return 'Tablet';
  if (userAgent.includes('Chrome')) return 'Chrome Desktop';
  if (userAgent.includes('Firefox')) return 'Firefox Desktop';
  if (userAgent.includes('Safari')) return 'Safari Desktop';
  if (userAgent.includes('Edge')) return 'Edge Desktop';
  return 'Unknown Device';
}

// 🎯 Cleanup old sessions (run periodically)
export function cleanupOldSessions() {
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  let cleaned = 0;
  for (const [sessionId, session] of activeSessions.entries()) {
    const lastActivity = new Date(session.lastActivity).getTime();

    // Clean up sessions older than 30 days OR inactive sessions that logged out
    if (lastActivity < thirtyDaysAgo || (!session.isActive && session.logoutTime)) {
      activeSessions.delete(sessionId);

      // Clean up user session tracking
      const userSessionIds = userSessions.get(session.userId);
      if (userSessionIds) {
        userSessionIds.delete(sessionId);
        if (userSessionIds.size === 0) {
          userSessions.delete(session.userId);
        }
      }

      cleaned++;
    }
  }

  console.log(`🎯 CLEANUP: Removed ${cleaned} old session records`);
  return cleaned;
}