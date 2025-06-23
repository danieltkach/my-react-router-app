import '@testing-library/jest-dom';
import { vi, beforeEach } from 'vitest';

// Ensure global is defined for jsdom
if (typeof global !== 'undefined') {
  global.IS_REACT_ACT_ENVIRONMENT = true;
}

// Mock window.scrollTo (used by your ScrollToTop component)
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
});

// Clean up after each test
beforeEach(() => {
  vi.clearAllMocks();
});
