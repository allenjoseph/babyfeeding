<script lang="ts">
  interface Props {
    loading: boolean;
    onclick: () => Promise<void>;
  }

  let { loading, onclick }: Props = $props();
</script>

<button
  type="button"
  class="btn absolute right-6 bottom-6 btn-circle btn-outline btn-secondary"
  aria-label="Refresh Icon Button"
  {onclick}
  disabled={loading}
>
  <span
    class={['icon-[tabler--refresh] size-6 shrink-0 dark:text-gray-300', loading && 'animate-spin']}
  >
  </span>
</button>
