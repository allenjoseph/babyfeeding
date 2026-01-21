<script lang="ts">
  import { asset } from '$app/paths';
  import { afterNavigate } from '$app/navigation';

  import './layout.css';

  let { children } = $props();

  afterNavigate(() => {
    window.HSStaticMethods.autoInit();
  });
</script>

<svelte:head>
  <link rel="icon" href="/favicon.ico" />
  <link rel="manifest" href="/site.webmanifest" />
</svelte:head>

<main class="mx-auto max-w-xl p-4">
  <div class="flex items-center gap-4">
    <img src={asset('/logo.svg')} alt="logo" class="size-20" />
    <h1 class="text-4xl text-base-content">Baby Feeding</h1>
  </div>
  {@render children()}
</main>
