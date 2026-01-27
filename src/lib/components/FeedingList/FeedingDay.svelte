<script lang="ts">
  import dayjs from 'dayjs';
  import type { Feeding } from '$lib/types';
  import FeedingProgress from './FeedingProgress.svelte';
  import FeedingItem from './FeedingItem/FeedingItem.svelte';

  interface Props {
    date: string;
    items: Feeding[] | undefined;
  }

  let { date, items }: Props = $props();

  let formatedDate = $derived(dayjs(date).format('dddd D MMMM, YYYY'));
</script>

<div>
  <p>
    {formatedDate} ({items?.length} times)
  </p>
  <FeedingProgress feedingItems={items} />
</div>
<ul class="timeline timeline-compact timeline-vertical mb-4 w-full timeline-snap-icon">
  {#each items as feeding (feeding.id)}
    <FeedingItem {feeding} />
  {/each}
</ul>
