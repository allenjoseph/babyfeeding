<script lang="ts">
  import { PipsMode, type target } from 'noUiSlider';
  import { formatSliderValue, mergeTooltips } from '$lib/slider';
  import type { FeedingItem } from '$lib/types';
  import dayjs from 'dayjs';
  import { onMount } from 'svelte';

  let {
    start,
    end,
    onUpdate = $bindable()
  }: FeedingItem & { onUpdate: (values: number[]) => void } = $props();

  let rangeSlider: target;

  const rangeOptions = $derived({
    start: [dayjs(start).valueOf(), dayjs(end).valueOf()],
    range: {
      min: dayjs(start).subtract(1, 'hour').valueOf(),
      max: dayjs(end).add(1, 'hour').valueOf()
    },
    connect: true,
    tooltips: true,
    cssClasses: {
      target:
        'relative h-2 rounded-full bg-neutral/10 range-slider-disabled:pointer-events-none range-slider-disabled:opacity-50',
      base: 'size-full relative z-1',
      origin: 'absolute top-0 end-0 rtl:start-0 size-full origin-[0_0] rounded-full',
      handle:
        'absolute top-1/2 end-0 rtl:start-0 size-4 bg-base-100 border-[3px] border-primary rounded-full translate-x-2/4 -translate-y-2/4 hover:cursor-grab active:cursor-grabbing hover:ring-2 ring-primary active:ring-[3px]',
      connects: 'relative z-0 w-full h-2 overflow-hidden',
      connect: 'absolute top-0 end-0 rtl:start-0 z-1 size-full bg-primary origin-[0_0]',
      touchArea: 'absolute -top-1 -bottom-1 -start-1 -end-1',
      tooltip:
        'bg-neutral text-sm text-neutral-content shadow-base-300/20 py-1 px-2 rounded-selector mb-3 absolute bottom-full start-2/4 -translate-x-2/4 rtl:translate-x-2/4 shadow-md text-nowrap',
      pips: 'relative w-full h-7 mt-3',
      value: 'absolute top-4 -translate-x-2/4 text-sm text-base-content/80 text-nowrap',
      marker: 'absolute border-s border-base-content/25',
      markerNormal: 'h-2',
      markerLarge: 'h-4'
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
          mode: PipsMode.Count,
          values: 5,
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
  class="mx-4 my-12"
  data-range-slider={JSON.stringify(rangeOptions)}
></div>
