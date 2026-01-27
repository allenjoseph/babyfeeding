<script lang="ts">
  import dayjs from 'dayjs';
  import type { Feeding } from '$lib/types';
  import { feedingState } from '$lib/stores/feeding.svelte';
  import RangeSlider from './RangeSlider.svelte';
  import TimelineDot from './TimelineDot.svelte';
  import ButtonDelete from './ButtonDelete.svelte';
  import TimelineHeader from './TimelineHeader.svelte';
  import ButtonSave from './ButtonSave.svelte';

  let { feeding }: { feeding: Feeding } = $props();

  let isSelected = $derived(feedingState?.selected?.id === feeding.id);

  function onUpdateTimeFrame([start, end]: number[]) {
    if (!feedingState.selected) return;
    feedingState.selected.start = dayjs(start).toDate();
    feedingState.selected.end = dayjs(end).toDate();
  }

  function formatTime(time: Date) {
    return dayjs(time).format('h:mm a');
  }
</script>

<li>
  <div class="timeline-middle">
    <TimelineDot {feeding} />
  </div>
  <div class="timeline-end m-3 ms-2 w-full rounded-lg">
    <TimelineHeader {feeding} />
    {#if feeding.end}
      <p>
        From {formatTime(feeding.start)} to {formatTime(feeding.end)}.
      </p>
    {:else}
      <p>
        Started at {formatTime(feeding.start)}.
      </p>
    {/if}
    {#if isSelected}
      <RangeSlider {...feeding} onUpdate={onUpdateTimeFrame} />
      <div class="flex items-center justify-between">
        <ButtonDelete />
        <ButtonSave {feeding} />
      </div>
    {/if}
  </div>
  <hr />
</li>
