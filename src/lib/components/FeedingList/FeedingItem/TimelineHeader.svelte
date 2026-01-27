<script lang="ts">
  import { feedingState } from '$lib/stores/feeding.svelte';
  import type { Feeding } from '$lib/types';
  import dayjs from 'dayjs';
  import ButtonSave from './ButtonSave.svelte';
  import ButtonCancel from './ButtonCancel.svelte';
  import ButtonEdit from './ButtonEdit.svelte';

  let { feeding }: { feeding: Feeding } = $props();

  let isSelected = $derived(feedingState?.selected?.id === feeding.id);
</script>

<div class="mb-2 flex pt-0.5 font-medium text-base-content">
  <div class="flex flex-1 gap-2">
    <p class="leading-4">
      {#if feeding.end}
        {dayjs(feeding.end).diff(feeding.start, 'minute')} minutes of {feeding.type}.
      {:else}
        <span class="text-primary italic">Ongoing feeding</span>
        <span class="loading loading-xs loading-dots text-primary"></span>
      {/if}
      <br />
      <span class="text-xs text-gray-300">{feeding.id}</span>
    </p>
  </div>
  {#if isSelected}
    {#if feedingState.loading}
      <span class="loading loading-spinner"></span>
    {:else}
      <div>
        <ButtonSave {feeding} />
        <ButtonCancel />
      </div>
    {/if}
  {:else if feeding.end}
    <ButtonEdit {feeding} />
  {/if}
</div>
