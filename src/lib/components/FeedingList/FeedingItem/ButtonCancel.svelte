<script lang="ts">
  import { feedingState } from '$lib/stores/feeding.svelte';
</script>

<button
  type="button"
  class="btn btn-text btn-sm"
  aria-label="cancel"
  onclick={() => (feedingState.selected = undefined)}
>
  <span class="icon-[tabler--x] size-6"></span>
</button>
