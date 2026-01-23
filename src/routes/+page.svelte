<script lang="ts">
  import dayjs from 'dayjs';
  import { onMount } from 'svelte';
  import { updateFeedingItem } from '$lib/services/firestore';
  import { getUser, validateSignInResult } from '$lib/services/auth';
  import { app } from '$lib/stores/state.svelte';
  import type { FeedingItem, FeedingType } from '$lib/types';
  import FormLogin from '$lib/components/FormLogin.svelte';
  import InputFeedingType from '$lib/components/InputFeedingType.svelte';
  import ButtonFeeding from '$lib/components/ButtonFeeding.svelte';
  import ProgressFeeding from '$lib/components/ProgressFeeding.svelte';
  import RangeDateSlider from '$lib/components/RangeDateSlider.svelte';
  import {
    endCurrentFeeding,
    refreshFeedingdata,
    startFeeding
  } from '$lib/services/feeding.svelte';
  import ButtonRefresh from '$lib/components/ButtonRefresh.svelte';

  let refreshLoading = $state(false);
  let updateLoading = $state(false);
  let feedingType = $derived<FeedingType>(app.currentFeeding?.type ?? 'breastmilk');
  let feedingGroupByDay = $derived(
    Object.groupBy(app.feedingData ?? [], (i) => dayjs(i.start).format('YYYY-MM-DD'))
  );
  let feedingLoading = $derived(app.feedingData === null);
  let authLoading = $derived(app.user === null);
  let selected = $state<FeedingItem>();

  async function onStartFeeding() {
    feedingLoading = true;
    await startFeeding(feedingType);
    feedingLoading = false;
  }

  async function onEndFeeding() {
    feedingLoading = true;
    await endCurrentFeeding(feedingType);
    feedingLoading = false;
  }

  async function onRefreshFeedingdata() {
    refreshLoading = true;
    await refreshFeedingdata();
    refreshLoading = false;
  }

  function onUpdateSelected([start, end]: number[]) {
    if (!selected) return;
    selected.start = dayjs(start).toDate();
    selected.end = dayjs(end).toDate();
  }

  async function onSaveChanges(current: FeedingItem, changes: FeedingItem) {
    if (!changes || JSON.stringify(changes) === JSON.stringify(current)) {
      selected = undefined;
      return;
    }

    updateLoading = true;
    await updateFeedingItem({ ...changes });
    await onRefreshFeedingdata();
    updateLoading = false;
    selected = undefined;
  }

  onMount(async () => {
    app.user = getUser() ?? (await validateSignInResult());
    if (app.user) {
      await refreshFeedingdata();
    }
  });
</script>

{#if !app.user}
  <FormLogin />
{:else if authLoading}
  <p class="mt-4 text-center text-lg text-base-content">
    <span class="loading loading-xl loading-ring"></span>
  </p>
{:else}
  <div class="card my-8 dark:border dark:border-b-gray-600">
    <div class="relative card-body items-center gap-y-4">
      <InputFeedingType bind:group={feedingType} />
      <p
        class="text-8xl font-medium tracking-tight text-gray-600 font-stretch-condensed dark:text-gray-300"
      >
        {app.timer.format('HH:mm:ss')}
      </p>
      <ButtonFeeding
        onclick={app.timerId ? onEndFeeding : onStartFeeding}
        loading={!!app.feedingData && feedingLoading}
        stop={!!app.timerId}
      />
      <ButtonRefresh onclick={onRefreshFeedingdata} loading={refreshLoading} />
    </div>
  </div>
  {#if !app.feedingData && feedingLoading}
    <p class="text-center text-lg text-base-content">
      <span class="loading loading-xs loading-spinner"></span>
      Loading feeding items.
    </p>
  {:else if app.feedingData?.length === 0}
    <p class="text-center text-lg text-base-content">No feeding items found.</p>
  {:else}
    {#each Object.entries(feedingGroupByDay) as [date, items] (date)}
      <div>
        <p>
          {dayjs(date).format('dddd D MMMM, YYYY')} ({items?.length} times)
        </p>
        <ProgressFeeding feedingItems={items} />
      </div>
      <ul class="timeline timeline-compact timeline-vertical mb-4 w-full timeline-snap-icon">
        {#each items as feeding (feeding.id)}
          <li>
            <div class="timeline-middle">
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
            </div>
            <div class="timeline-end m-3 ms-2 w-full rounded-lg">
              <div class="mb-2 flex pt-0.5 font-medium text-base-content">
                <p class="flex-1 leading-4">
                  {#if feeding.end}
                    {dayjs(feeding.end).diff(feeding.start, 'minute')} minutes of {feeding.type}.
                  {:else}
                    <span class="text-primary italic">Ongoing feeding</span>
                    <span class="loading loading-xs loading-dots text-primary"></span>
                  {/if}
                  <br />
                  <span class="text-xs text-gray-300">{feeding.id}</span>
                </p>
                {#if feeding.id === selected?.id}
                  {#if updateLoading}
                    <span class="loading loading-spinner"></span>
                  {:else}
                    <div>
                      <button
                        type="button"
                        aria-label="save"
                        onclick={() => onSaveChanges(feeding, { ...selected! })}
                      >
                        <span class="icon-[tabler--check] size-6"></span>
                      </button>
                      <button
                        type="button"
                        aria-label="save"
                        onclick={() => (selected = undefined)}
                      >
                        <span class="icon-[tabler--x] size-6"></span>
                      </button>
                    </div>
                  {/if}
                {:else}
                  <button
                    type="button"
                    aria-label="edit"
                    onclick={() => (selected = { ...feeding })}
                  >
                    <span class="icon-[tabler--pencil] size-6"></span>
                  </button>
                {/if}
              </div>
              <p>
                Start at {dayjs(feeding.start).format('h:mm a')}.
              </p>
              {#if feeding.end}
                <p>End at {dayjs(feeding.end).format('h:mm a')}.</p>
              {/if}
              {#if selected?.id === feeding.id}
                <RangeDateSlider {...feeding} onUpdate={onUpdateSelected} />
              {/if}
            </div>
            <hr />
          </li>
        {/each}
      </ul>
    {/each}
  {/if}
{/if}
