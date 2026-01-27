<script lang="ts">
  import { app } from '$lib/stores/state.svelte';

  let timeDisplay = $derived(app.timer.format('HH:mm:ss'));
</script>

<p
  class="text-8xl font-medium tracking-tight text-gray-600 font-stretch-condensed dark:text-gray-300"
>
  {timeDisplay}
</p>
