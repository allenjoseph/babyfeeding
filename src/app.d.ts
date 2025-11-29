import type { IStaticMethods } from 'flyonui/flyonui';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  interface Window {
    // plugins
    noUiSlider;
    HSRangeSlider;

    // FlyonUI
    HSStaticMethods: IStaticMethods;
  }
}

export {};
