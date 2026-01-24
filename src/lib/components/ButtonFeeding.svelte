<script lang="ts">
  import { endFeeding, startFeeding } from '$lib/services/feeding.svelte';
  import { app } from '$lib/stores/state.svelte';
  import type { FeedingType } from '$lib/types';

  let { disabled = false } = $props();

  let loading = $state(false);
  let feedingType = $derived<FeedingType>(app.currentFeeding?.type ?? 'breastmilk');

  async function onStartFeeding() {
    loading = true;
    await startFeeding(feedingType);
    loading = false;
  }

  async function onEndFeeding() {
    loading = true;
    await endFeeding(feedingType);
    loading = false;
  }
</script>

<button
  class={['btn btn-gradient', app.timerId ? 'btn-error' : 'btn-success']}
  onclick={app.timerId ? onEndFeeding : onStartFeeding}
  disabled={disabled || loading}
>
  {#if loading}
    <span class="loading loading-spinner"></span>
  {/if}
  <span
    class={[
      'size-6 shrink-0',
      app.timerId ? 'icon-[tabler--player-stop-filled]' : 'icon-[tabler--player-play-filled]'
    ]}
  ></span>
</button>
