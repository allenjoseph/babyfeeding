<script lang="ts">
  interface Props {
    loading: boolean;
    onclick: () => Promise<void>;
    children: () => any;
    classes?: string;
  }

  let { loading, onclick, classes, children }: Props = $props();
</script>

<button class={['btn btn-gradient', classes]} {onclick} disabled={loading}>
  {#if loading}
    <span class="loading loading-spinner"></span>
  {/if}
  {@render children?.()}
</button>
