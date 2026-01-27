<script lang="ts">
  import { onMount } from 'svelte';
  import { asset } from '$app/paths';
  import { afterNavigate } from '$app/navigation';
  import { getUser, validateSignInResult } from '$lib/services/auth';
  import { refreshFeedingdata } from '$lib/services/feeding.svelte';
  import { app } from '$lib/stores/state.svelte';

  import '../app.css';

  let { children } = $props();

  let loading = $state(false);

  afterNavigate(() => {
    window.HSStaticMethods.autoInit();
  });

  onMount(async () => {
    loading = true;
    app.user = getUser() ?? (await validateSignInResult());
    if (app.user) {
      await refreshFeedingdata();
    }
    loading = false;
  });
</script>

<svelte:head>
  <link rel="icon" href="/favicon.ico" />
  <link rel="manifest" href="/site.webmanifest" />
</svelte:head>

<main class="mx-auto max-w-xl p-4">
  <div class="flex items-end gap-1">
    <img src={asset('/logo.svg')} alt="logo" class="size-20" />
    <h1 class="text-5xl text-base-content font-stretch-extra-condensed">Baby Feeding</h1>
  </div>
  {#if loading}
    <p class="mt-8 text-center text-base-content">
      <span class="loading loading-xl loading-ring"></span>
    </p>
  {:else}
    {@render children()}
  {/if}
</main>
