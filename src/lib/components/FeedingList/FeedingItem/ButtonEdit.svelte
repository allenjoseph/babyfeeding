<script lang="ts">
  import { feedingState } from '$lib/stores/feeding.svelte';
  import type { Feeding } from '$lib/types';

  let { feeding }: { feeding: Feeding } = $props();
</script>

<button
  type="button"
  class="btn btn-text btn-sm"
  aria-label="edit"
  onclick={() => (feedingState.selected = { ...feeding })}
>
  <span class="icon-[tabler--pencil] size-6"></span>
</button>
