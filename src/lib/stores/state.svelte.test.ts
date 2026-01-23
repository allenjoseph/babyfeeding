import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

vi.stubGlobal('localStorage', localStorageMock);

import { app } from './state.svelte';

describe('state.svelte.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    app.feedingData = null;
    app.currentFeeding = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('app state', () => {
    it('should have initial state structure', async () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          uid: 'test-uid',
          email: 'test@test.com',
          displayName: 'Test',
          photoURL: null
        })
      );
      expect(app).toHaveProperty('user');
      expect(app).toHaveProperty('feedingData');
      expect(app).toHaveProperty('currentFeeding');
      expect(app).toHaveProperty('timer');
    });
  });
});
