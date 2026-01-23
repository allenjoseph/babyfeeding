import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import dayjs from 'dayjs';
import type { FeedingItem } from '$lib/types';

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

vi.stubGlobal('localStorage', localStorageMock);

const mockSetInterval = vi.fn(() => 123);
const mockClearInterval = vi.fn();

vi.stubGlobal('setInterval', mockSetInterval);
vi.stubGlobal('clearInterval', mockClearInterval);

vi.mock('./firestore', () => ({
  queryFeedingItems: vi.fn()
}));

vi.mock('$lib/stores/state.svelte', () => ({
  app: {
    user: {},
    feedingData: null,
    currentFeeding: null,
    timer: dayjs().startOf('day')
  }
}));

import { app } from '$lib/stores/state.svelte';
import { queryFeedingItems } from './firestore';
import { refreshFeedingdata, resetTimer, startTimer } from './feeding.svelte';

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

  describe('resetTimer', () => {
    it('should clear timerId', async () => {
      resetTimer();
      expect(app.timerId).toBeUndefined();
    });

    it('should reset timer to start of day', async () => {
      const startDate = new Date('2024-01-15T10:00:00Z');
      vi.setSystemTime(startDate);
      resetTimer();
      expect(app.timer.format('HH:mm:ss')).toBe('00:00:00');
    });

    it('should clear timerId when timerId is set', async () => {
      const startDate = new Date('2024-01-15T10:00:00Z');
      startTimer(startDate);
      resetTimer();
      expect(app.timerId).toBeUndefined();
    });
  });

  describe('startTimer', () => {
    it('should start timer with given start date', async () => {
      const startDate = new Date('2024-01-15T10:00:00Z');
      startTimer(startDate);
      expect(app.timerId).toBeDefined();
    });

    it('should clear existing timer before starting new one', async () => {
      const startDate1 = new Date('2024-01-15T10:00:00Z');
      const startDate2 = new Date('2024-01-15T12:00:00Z');
      startTimer(startDate1);
      const firstTimerId = app.timerId;
      startTimer(startDate2);
      expect(app.timerId).not.toBe(firstTimerId);
    });

    it('should set timer to elapsed time from start date', async () => {
      const startDate = new Date('2024-01-15T10:00:00Z');
      const currentTime = new Date('2024-01-15T10:30:00Z');
      vi.setSystemTime(currentTime);
      startTimer(startDate);
      expect(app.timer.format('HH:mm:ss')).toBe('00:30:00');
    });

    it('should start timer interval', async () => {
      const startDate = new Date('2024-01-15T10:00:00Z');
      startTimer(startDate);
      expect(app.timerId).toBeDefined();
      expect(app.timerId).not.toBeNull();
    });

    it('should clear previous timer interval before starting new one', async () => {
      const startDate1 = new Date('2024-01-15T10:00:00Z');
      const startDate2 = new Date('2024-01-15T12:00:00Z');
      startTimer(startDate1);
      const firstTimerId = app.timerId;
      startTimer(startDate2);
      expect(app.timerId).not.toBe(firstTimerId);
    });

    it('should reset timer and clear timerId', async () => {
      const startDate = new Date('2024-01-15T10:00:00Z');
      startTimer(startDate);
      expect(app.timerId).toBeDefined();
      resetTimer();
      expect(app.timerId).toBeUndefined();
    });
  });

  describe('refreshFeedingdata', () => {
    it('should set feedingData when data is fetched', async () => {
      const mockFeedingData: FeedingItem[] = [{ id: '1', start: new Date(), type: 'breastmilk' }];

      vi.mocked(queryFeedingItems).mockResolvedValue(mockFeedingData);

      await refreshFeedingdata();

      expect(app.feedingData).toEqual(mockFeedingData);
    });

    it('should set currentFeeding when feeding is in progress', async () => {
      const inProgressFeeding: FeedingItem = {
        id: '2',
        start: new Date(),
        type: 'formula'
      };
      const completedFeeding: FeedingItem = {
        id: '3',
        start: new Date(Date.now() - 3600000),
        end: new Date(),
        type: 'solid'
      };

      vi.mocked(queryFeedingItems).mockResolvedValue([inProgressFeeding, completedFeeding]);

      await refreshFeedingdata();

      expect(app.currentFeeding).toEqual(inProgressFeeding);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'baby-feeding-current-feeding',
        JSON.stringify(app.currentFeeding)
      );
    });

    it('should not set currentFeeding when all feedings are complete', async () => {
      const completedFeeding: FeedingItem = {
        id: '4',
        start: new Date(Date.now() - 3600000),
        end: new Date(),
        type: 'breastmilk'
      };

      vi.mocked(queryFeedingItems).mockResolvedValue([completedFeeding]);

      await refreshFeedingdata();

      expect(app.currentFeeding).toBeNull();
    });

    it('should call startTimer when feeding is in progress', async () => {
      const inProgressFeeding: FeedingItem = {
        id: '5',
        start: new Date(),
        type: 'breastmilk'
      };

      vi.mocked(queryFeedingItems).mockResolvedValue([inProgressFeeding]);

      await refreshFeedingdata();

      expect(app.timerId).toBeDefined();
    });

    it('should handle empty feeding data', async () => {
      vi.mocked(queryFeedingItems).mockResolvedValue([]);

      await refreshFeedingdata();

      expect(app.feedingData).toEqual([]);
      expect(app.currentFeeding).toBeNull();
    });

    it('should clear currentFeeding when no feeding in progress', async () => {
      const completedFeeding: FeedingItem = {
        id: '6',
        start: new Date(Date.now() - 7200000),
        end: new Date(Date.now() - 3600000),
        type: 'solid'
      };

      vi.mocked(queryFeedingItems).mockResolvedValue([completedFeeding]);

      await refreshFeedingdata();

      expect(app.currentFeeding).toBeNull();
    });

    it('should handle error when fetching data fails', async () => {
      vi.mocked(queryFeedingItems).mockRejectedValue(new Error('Network error'));

      await expect(refreshFeedingdata()).rejects.toThrow('Network error');
    });
  });
});
