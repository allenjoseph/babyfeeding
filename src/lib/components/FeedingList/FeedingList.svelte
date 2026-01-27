<script lang="ts">
  import dayjs from 'dayjs';
  import { app } from '$lib/stores/state.svelte';
  import FeedingDay from './FeedingDay.svelte';

  let feedingGroupByDay = $derived(
    Object.groupBy(app.feedingData ?? [], (i) => dayjs(i.start).format('YYYY-MM-DD'))
  );
</script>

{#if !app.feedingData}
  <p class="text-center text-lg text-base-content">
    <span class="loading loading-xs loading-spinner"></span>
    Loading feeding items.
  </p>
{:else if app.feedingData?.length === 0}
  <p class="text-center text-lg text-base-content">No feeding items found.</p>
{:else}
  {#each Object.entries(feedingGroupByDay) as [date, items] (date)}
    <FeedingDay {date} {items} />
  {/each}
{/if}
