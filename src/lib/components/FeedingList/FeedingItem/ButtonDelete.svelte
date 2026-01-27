<script lang="ts">
  import { feedingState } from '$lib/stores/feeding.svelte';
</script>

<button
  type="button"
  aria-label="delete"
  class="btn btn-text btn-sm btn-error"
  onclick={feedingState.onDelete}
  disabled={feedingState.loading}
>
  <span class="icon-[tabler--trash] size-6"></span>
</button>
