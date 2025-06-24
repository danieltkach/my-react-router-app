import { describe, it, expect } from 'vitest';
import { getUser, createSession } from './auth.server';

describe('Auth System', () => {
  // Test 2: getUser function (reads cookies from Request object)
  describe('getUser', () => {

    // Helper function to create mock Request objects
    function createMockRequest(cookieValue: string = '') {
      return new Request('http://localhost', {
        headers: {
          'Cookie': cookieValue
        }
      });
    }

    it('returns admin user for admin session cookie', async () => {
      const request = createMockRequest('session=admin');
      const user = await getUser(request);

      expect(user).not.toBeNull();
      expect(user?.name).toBe('Admin User');
      expect(user?.email).toBe('admin@example.com');
      expect(user?.role).toBe('admin');
      expect(user?.permissions).toContain('manage_system');
    });

    it('returns manager user for manager session cookie', async () => {
      const request = createMockRequest('session=manager');
      const user = await getUser(request);

      expect(user).not.toBeNull();
      expect(user?.name).toBe('Manager User');
      expect(user?.role).toBe('manager');
      expect(user?.permissions).toContain('manage_users');
      expect(user?.permissions).not.toContain('manage_system'); // manager shouldn't have admin perms
    });

    it('returns regular user for user session cookie', async () => {
      const request = createMockRequest('session=user');
      const user = await getUser(request);

      expect(user).not.toBeNull();
      expect(user?.role).toBe('user');
      expect(user?.permissions).toEqual(['read', 'write_own']);
    });

    it('returns null for invalid session cookie', async () => {
      const request = createMockRequest('session=hacker');
      const user = await getUser(request);

      expect(user).toBeNull();
    });

    it('returns null when no cookie present', async () => {
      const request = createMockRequest('');
      const user = await getUser(request);

      expect(user).toBeNull();
    });

    it('handles multiple cookies correctly', async () => {
      const request = createMockRequest('other=value; session=admin; another=test');
      const user = await getUser(request);

      expect(user).not.toBeNull();
      expect(user?.role).toBe('admin');
    });
  });

  // Test 3: createSession function (validates credentials)
  describe('createSession', () => {

    it('creates admin session for valid admin credentials', async () => {
      const sessionCookie = await createSession('admin@example.com', 'password');

      expect(sessionCookie).not.toBeNull();
      expect(sessionCookie).toContain('session=admin');
      expect(sessionCookie).toContain('HttpOnly');
      expect(sessionCookie).toContain('SameSite=Lax');
      expect(sessionCookie).toContain('Max-Age=86400');
    });

    it('creates manager session for valid manager credentials', async () => {
      const sessionCookie = await createSession('manager@example.com', 'password');

      expect(sessionCookie).toContain('session=manager');
    });

    it('creates user session for valid user credentials', async () => {
      const sessionCookie = await createSession('user@example.com', 'password');

      expect(sessionCookie).toContain('session=user');
    });

    it('returns null for invalid email', async () => {
      const sessionCookie = await createSession('hacker@evil.com', 'password');

      expect(sessionCookie).toBeNull();
    });

    it('returns null for invalid password', async () => {
      const sessionCookie = await createSession('admin@example.com', 'wrongpassword');

      expect(sessionCookie).toBeNull();
    });

    it('returns null for empty credentials', async () => {
      const sessionCookie = await createSession('', '');

      expect(sessionCookie).toBeNull();
    });
  });

  // Test 4: Integration test (createSession + getUser workflow)
  describe('Auth Workflow Integration', () => {

    it('should complete full auth cycle: create session -> use session -> get user', async () => {
      // Step 1: Login with valid credentials
      const sessionCookie = await createSession('admin@example.com', 'password');
      expect(sessionCookie).not.toBeNull();

      // Step 2: Extract just the cookie value (simulate browser sending it back)
      const cookieValue = sessionCookie!.split(';')[0]; // Get "session=admin" part

      // Step 3: Use that cookie to get user
      const request = new Request('http://localhost', {
        headers: { 'Cookie': cookieValue }
      });

      const user = await getUser(request);

      // Step 4: Verify we got the right user
      expect(user).not.toBeNull();
      expect(user?.email).toBe('admin@example.com');
      expect(user?.role).toBe('admin');
    });
  });
});

// 🎯 LEARNING CONCEPTS DEMONSTRATED:

// 1. **Mocking HTTP Requests**: We create fake Request objects with cookies
// 2. **Testing Async Functions**: Using await with your auth functions  
// 3. **Testing Pure Functions**: Simple input/output testing
// 4. **Testing Integration**: Multiple functions working together
// 5. **Edge Cases**: Invalid inputs, missing data, etc.
