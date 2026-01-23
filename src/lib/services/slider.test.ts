import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import dayjs from 'dayjs';
import { formatSliderValue, mergeTooltips } from './slider';

describe('slider.ts', () => {
  const date = new Date('2026-01-01T12:00:00Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(date);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('formatSliderValue', () => {
    it('formats numeric timestamp correctly', () => {
      const ts = date.getTime();
      const expected = dayjs(ts).format('hh:mm a');
      expect(formatSliderValue(ts)).toBe(expected);
    });

    it('formats string numeric timestamp correctly', () => {
      const ts = String(date.getTime());
      const expected = dayjs(Number(ts)).format('hh:mm a');
      expect(formatSliderValue(ts)).toBe(expected);
    });
  });

  describe('mergeTooltips', () => {
    it('merges close tooltips and hides the active handle tooltip', () => {
      const tool0 = document.createElement('div');
      const tool1 = document.createElement('div');
      const tooltips = [tool0, tool1];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let updateCb: any;
      const slider = {
        noUiSlider: {
          getTooltips: () => tooltips,
          on: (event: string, cb: () => void) => {
            if (event === 'update') updateCb = cb;
          }
        }
      };

      mergeTooltips(slider as never, 5, ' — ');

      const values = [date.getTime(), date.getTime() + 15 * 60 * 1000]; // 15 minutes apart
      const positions = [10, 12]; // within threshold 5 -> merge
      const activeHandle = 1;

      // invoke the update callback as noUiSlider would
      updateCb(values, activeHandle, null, false, positions);

      const formatted0 = formatSliderValue(values[0]);
      const formatted1 = formatSliderValue(values[1]);
      const joined = `${formatted0} — ${formatted1}`;

      expect(tool0.innerHTML).toBe(joined);
      expect(tool0.style.display).toBe('block');

      expect(tool1.innerHTML).toBe(joined);
      expect(tool1.style.display).toBe('none'); // active hidden when merged
    });

    it('does not merge distant tooltips and shows each separately', () => {
      const tool0 = document.createElement('div');
      const tool1 = document.createElement('div');
      const tooltips = [tool0, tool1];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let updateCb: any;
      const slider = {
        noUiSlider: {
          getTooltips: () => tooltips,
          on: (event: string, cb: () => void) => {
            if (event === 'update') updateCb = cb;
          }
        }
      };

      mergeTooltips(slider as never, 1, ' / '); // small threshold so they won't merge

      const values = [date.getTime(), date.getTime() + 30 * 60 * 1000]; // 30 minutes apart
      const positions = [10, 20]; // difference 10 > threshold
      const activeHandle = 0;

      updateCb(values, activeHandle, null, false, positions);

      expect(tool0.innerHTML).toBe(formatSliderValue(values[0]));
      expect(tool0.style.display).toBe('block');

      expect(tool1.innerHTML).toBe(formatSliderValue(values[1]));
      expect(tool1.style.display).toBe('block');
    });

    it('handles slider with undefined tooltips', () => {
      const slider = {
        noUiSlider: {
          getTooltips: () => undefined,
          on: (event: string, cb: (...args: unknown[]) => void) => {
            if (event === 'update') {
              const values = [date.getTime(), date.getTime() + 30 * 60 * 1000];
              const positions = [10, 20];
              const activeHandle = 0;
              cb(values, activeHandle, null, false, positions);
            }
          }
        }
      };

      expect(() => mergeTooltips(slider as never, 5, ' - ')).not.toThrow();
    });

    it('handles tooltips with null values', () => {
      const tool0 = document.createElement('div');
      const tool1 = null;
      const tooltips = [tool0, tool1];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let updateCb: any;
      const slider = {
        noUiSlider: {
          getTooltips: () => tooltips,
          on: (event: string, cb: () => void) => {
            if (event === 'update') updateCb = cb;
          }
        }
      };

      mergeTooltips(slider as never, 5, ' — ');

      const values = [date.getTime(), date.getTime() + 30 * 60 * 1000];
      const positions = [10, 20];
      const activeHandle = 0;

      expect(() => updateCb(values, activeHandle, null, false, positions)).not.toThrow();
      expect(tool0.innerHTML).toBe(formatSliderValue(values[0]));
    });

    it('handles single tooltip', () => {
      const tool0 = document.createElement('div');
      const tooltips = [tool0];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let updateCb: any;
      const slider = {
        noUiSlider: {
          getTooltips: () => tooltips,
          on: (event: string, cb: () => void) => {
            if (event === 'update') updateCb = cb;
          }
        }
      };

      mergeTooltips(slider as never, 5, ' — ');

      const values = [date.getTime()];
      const positions = [10];
      const activeHandle = 0;

      updateCb(values, activeHandle, null, false, positions);

      expect(tool0.innerHTML).toBe(formatSliderValue(values[0]));
      expect(tool0.style.display).toBe('block');
    });

    it('handles multiple tooltips with different merge pools', () => {
      const tool0 = document.createElement('div');
      const tool1 = document.createElement('div');
      const tool2 = document.createElement('div');
      const tooltips = [tool0, tool1, tool2];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let updateCb: any;
      const slider = {
        noUiSlider: {
          getTooltips: () => tooltips,
          on: (event: string, cb: () => void) => {
            if (event === 'update') updateCb = cb;
          }
        }
      };

      mergeTooltips(slider as never, 3, ' | ');

      const values = [
        date.getTime(),
        date.getTime() + 2 * 60 * 1000, // 2 min apart - will merge with first
        date.getTime() + 10 * 60 * 1000 // 10 min apart - new pool
      ];
      const positions = [10, 11, 25]; // positions: 10 and 11 are close (diff 1), 25 is far (diff 14)
      const activeHandle = 1;

      updateCb(values, activeHandle, null, false, positions);

      // tool0 and tool1 are in the same pool (merged)
      const mergedValue0 = `${formatSliderValue(values[0])} | ${formatSliderValue(values[1])}`;
      expect(tool0.innerHTML).toBe(mergedValue0);
      expect(tool1.innerHTML).toBe(mergedValue0);
      // tool0 is visible (not active handle)
      expect(tool0.style.display).toBe('block');
      // tool1 is hidden (active handle in a merged pool)
      expect(tool1.style.display).toBe('none');
      // tool2 is in its own pool (not merged)
      expect(tool2.style.display).toBe('block');
      expect(tool2.innerHTML).toBe(formatSliderValue(values[2]));
    });

    it('handles null tooltip in the middle of the array', () => {
      const tool0 = document.createElement('div');
      const tool1 = null;
      const tool2 = document.createElement('div');
      const tooltips = [tool0, tool1, tool2];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let updateCb: any;
      const slider = {
        noUiSlider: {
          getTooltips: () => tooltips,
          on: (event: string, cb: () => void) => {
            if (event === 'update') updateCb = cb;
          }
        }
      };

      mergeTooltips(slider as never, 5, ' - ');

      const values = [
        date.getTime(),
        date.getTime() + 20 * 60 * 1000,
        date.getTime() + 40 * 60 * 1000
      ];
      const positions = [10, 50, 90];
      const activeHandle = 2;

      updateCb(values, activeHandle, null, false, positions);

      expect(tool0.innerHTML).toBe(formatSliderValue(values[0]));
      expect(tool2.innerHTML).toBe(formatSliderValue(values[2]));
      // tool2 is visible since no merge happened (positions are far apart)
      expect(tool2.style.display).toBe('block');
    });
  });
});
