<script lang="ts">
  import { feedingState } from '$lib/stores/feeding.svelte';
  import type { Feeding } from '$lib/types';

  let { feeding }: { feeding: Feeding } = $props();
</script>

<button
  type="button"
  class="btn btn-text btn-sm underline underline-offset-4 btn-success"
  aria-label="save"
  onclick={() => feedingState.onUpdate(feeding, { ...feedingState.selected! })}
>
  <span class="icon-[tabler--check] size-6"></span>Save
</button>
