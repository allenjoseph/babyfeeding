<script lang="ts">
  import { endFeeding, startFeeding } from '$lib/services/feeding.svelte';
  import { app } from '$lib/stores/state.svelte';
  import { feedingState } from '$lib/stores/feeding.svelte';
  import type { feedingType } from '$lib/types';

  let { type }: { type: feedingType } = $props();

  let loading = $state(false);

  async function onStartFeeding() {
    loading = true;
    await startFeeding(type);
    loading = false;
  }

  async function onEndFeeding() {
    loading = true;
    await endFeeding(type);
    loading = false;
  }
</script>

<button
  class={['btn btn-gradient', app.timerId ? 'btn-error' : 'btn-success']}
  onclick={app.timerId ? onEndFeeding : onStartFeeding}
  disabled={feedingState.loading || loading}
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
