<script lang="ts">
  import { app } from '$lib/stores/state.svelte';
  import type { feedingType } from '$lib/types';
  import ButtonRefresh from './components/ButtonRefresh.svelte';
  import ButtonStart from './components/ButtonStart.svelte';
  import FeedingType from './components/FeedingType.svelte';
  import TimeDisplay from './components/TimeDisplay.svelte';

  let type = $derived<feedingType>(app.currentFeeding?.type ?? 'breastmilk');
</script>

<div class="card-border card my-8">
  <div class="relative card-body items-center gap-y-4">
    <div class="flex flex-col items-center gap-y-4">
      <FeedingType bind:group={type} />
      <TimeDisplay />
      <ButtonStart {type} />
      <ButtonRefresh />
    </div>
  </div>
</div>
