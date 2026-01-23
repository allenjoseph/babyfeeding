<script lang="ts">
  import {
    formatSliderValue,
    mergeTooltips,
    SliderPipsMode,
    type SliderTarget
  } from '$lib/services/slider';
  import type { FeedingItem } from '$lib/types';
  import dayjs from 'dayjs';
  import { onMount } from 'svelte';

  let {
    start,
    end,
    onUpdate = $bindable()
  }: FeedingItem & { onUpdate: (values: number[]) => void } = $props();

  let rangeSlider: SliderTarget;

  const rangeOptions = $derived({
    start: [dayjs(start).valueOf(), dayjs(end).valueOf()],
    range: {
      min: dayjs(start).subtract(1, 'hour').valueOf(),
      max: dayjs(end).add(1, 'hour').valueOf()
    },
    connect: true,
    tooltips: true,
    cssClasses: {
      target: 'range-slider--target',
      base: 'range-slider--base',
      origin: 'range-slider--origin',
      handle: 'range-slider--handle',
      connects: 'range-slider--connects',
      connect: 'range-slider--connect',
      touchArea: 'range-slider--touch-area',
      tooltip: 'range-slider--tooltip',
      pips: 'range-slider--pips',
      value: 'range-slider--value',
      marker: 'range-slider--marker',
      markerNormal: 'range-slider--marker-normal',
      markerLarge: 'range-slider--marker-large'
    }
  });

  onMount(() => {
    window.HSStaticMethods.autoInit();

    rangeSlider?.noUiSlider?.on('update', (values: (string | number)[]) => {
      onUpdate(values.map(Number));
    });

    rangeSlider.noUiSlider?.updateOptions(
      {
        pips: {
          mode: SliderPipsMode.Count,
          values: 3,
          format: { to: formatSliderValue }
        },
        tooltips: { to: formatSliderValue }
      },
      false
    );

    mergeTooltips(rangeSlider, 15, ' - ');
  });
</script>

<div
  bind:this={rangeSlider}
  class="my-12 mr-8 ml-4"
  data-range-slider={JSON.stringify(rangeOptions)}
></div>

<style>
  @reference "../../app.css";

  :global {
    .range-slider--target {
      @apply relative h-2 rounded-full bg-neutral/10 range-slider-disabled:pointer-events-none range-slider-disabled:opacity-50;
    }
    .range-slider--base {
      @apply relative z-1 size-full;
    }
    .range-slider--origin {
      @apply absolute end-0 top-0 size-full origin-top-left rounded-full rtl:start-0;
    }
    .range-slider--handle {
      @apply absolute end-0 top-1/2 size-4 translate-x-2/4 -translate-y-2/4 rounded-full border-[3px] border-primary bg-base-100 ring-primary hover:cursor-grab hover:ring-2 active:cursor-grabbing active:ring-[3px] rtl:start-0;
    }
    .range-slider--connects {
      @apply relative z-0 h-2 w-full overflow-hidden;
    }
    .range-slider--connect {
      @apply absolute end-0 top-0 z-1 size-full origin-top-left bg-primary rtl:start-0;
    }
    .range-slider--touch-area {
      @apply absolute -start-1 -end-1 -top-1 -bottom-1;
    }
    .range-slider--tooltip {
      @apply absolute start-2/4 bottom-full mb-3 -translate-x-2/4 rounded-selector bg-neutral px-2 py-1 text-sm text-nowrap text-neutral-content shadow-md shadow-base-300/20 rtl:translate-x-2/4;
    }
    .range-slider--pips {
      @apply relative mt-3 h-7 w-full;
    }
    .range-slider--value {
      @apply absolute top-4 -translate-x-2/4 text-sm text-nowrap text-base-content/80;
    }
    .range-slider--marker {
      @apply absolute border-s border-base-content/25;
    }
    .range-slider--marker-normal {
      @apply h-2;
    }
    .range-slider--marker-large {
      @apply h-4;
    }
  }
</style>
