<script lang="ts">
  import { refreshFeedingdata } from '$lib/services/feeding.svelte';

  let { disabled = false } = $props();

  let loading = $state(false);

  async function onRefresh() {
    loading = true;
    await refreshFeedingdata();
    loading = false;
  }
</script>

<button
  type="button"
  class="btn absolute right-6 bottom-6 btn-circle btn-outline btn-secondary"
  aria-label="Refresh Icon Button"
  onclick={onRefresh}
  disabled={disabled || loading}
>
  <span
    class={['icon-[tabler--refresh] size-6 shrink-0 dark:text-gray-300', loading && 'animate-spin']}
  >
  </span>
</button>
