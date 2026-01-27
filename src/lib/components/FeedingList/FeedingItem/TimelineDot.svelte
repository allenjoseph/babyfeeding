<script lang="ts">
  import type { Feeding } from '$lib/types';

  let { feeding }: { feeding: Feeding } = $props();
</script>

<span class="flex size-4.5 items-center justify-center rounded-full bg-primary/20">
  <span
    class={[
      'badge size-3 rounded-full p-0',
      feeding.end
        ? feeding.type === 'breastmilk'
          ? 'badge-success'
          : 'badge-error'
        : 'badge-primary'
    ]}
  ></span>
</span>
