<script lang="ts">
  import { app } from '$lib/stores/state.svelte';
  import FormLogin from '$lib/components/FormLogin.svelte';
  import FeedingTimer from '$lib/components/FeedingTimer/FeedingTimer.svelte';
  import FeedingList from '$lib/components/FeedingList/FeedingList.svelte';
</script>

{#if !app.user}
  <FormLogin />
{:else}
  <FeedingTimer />
  <FeedingList />
{/if}
