<script lang="ts">
  import type { FeedingItem } from '$lib/types';

  let { feedingItems }: { feedingItems?: FeedingItem[] } = $props();

  const reverseItems = $derived(feedingItems?.toReversed());

  const maxDailyFeedings = 15;
</script>

<div class="my-2 flex items-center gap-x-1">
  {#each Array(maxDailyFeedings) as _, i}
    <div
      class={[
        'progress-step',
        reverseItems?.[i]?.start && reverseItems?.[i]?.type === 'breastmilk'
          ? 'bg-success'
          : reverseItems?.[i]?.type === 'formula'
            ? 'bg-error'
            : ''
      ]}
      role="progressbar"
      aria-label="Progressbar"
      aria-valuenow={100 / maxDailyFeedings}
      aria-valuemin={0}
      aria-valuemax="100"
    ></div>
  {/each}
  <!-- <p class="ms-1 text-xs font-medium text-success">
    {Math.floor(((feedingItems?.length ?? 0) / maxDailyFeedings) * 100)}%
  </p> -->
</div>
