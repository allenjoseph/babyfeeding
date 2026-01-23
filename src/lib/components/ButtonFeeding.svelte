<script lang="ts">
  interface Props {
    loading: boolean;
    onclick: () => Promise<void>;
    stop?: boolean;
  }

  let { loading, onclick, stop }: Props = $props();
</script>

<button
  class={['btn btn-gradient', stop ? 'btn-error' : 'btn-success']}
  {onclick}
  disabled={loading}
>
  {#if loading}
    <span class="loading loading-spinner"></span>
  {/if}
  <span
    class={[
      'size-6 shrink-0',
      stop ? 'icon-[tabler--player-stop-filled]' : 'icon-[tabler--player-play-filled]'
    ]}
  ></span>
</button>
