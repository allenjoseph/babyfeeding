<script lang="ts">
  import dayjs from 'dayjs';
  import { onMount } from 'svelte';
  import { addFeedingItem, updateFeedingItem } from '$lib/firestore';
  import {
    app,
    loadFeedingData,
    refreshFeedingdata,
    resetTimer,
    startTimer
  } from '$lib/state.svelte';
  import { getUser, validateSignInResult } from '$lib/auth';
  import type { FeedingType } from '$lib/types';
  import FormLogin from '$lib/components/FormLogin.svelte';
  import InputFeedingType from '$lib/components/InputFeedingType.svelte';
  import ButtonFeeding from '$lib/components/ButtonFeeding.svelte';
  import ProgressFeeding from '$lib/components/ProgressFeeding.svelte';

  let feedingType = $state<FeedingType>('breastmilk');
  let feedingGroupByDay = $derived(
    Object.groupBy(app.feedingData ?? [], (i) => dayjs(i.start).format('YYYY-MM-DD'))
  );
  let feedingLoading = $derived(app.feedingData === null);
  let authLoading = $derived(app.user === null);

  async function onStartFeeding() {
    feedingLoading = true;
    app.currentFeeding = await addFeedingItem({
      start: dayjs().toDate(),
      type: feedingType
    });

    localStorage.setItem('baby-feeding-current-feeding', JSON.stringify(app.currentFeeding));
    await refreshFeedingdata();
    feedingLoading = false;
  }

  async function onEndFeeding() {
    if (!app.currentFeeding) return;

    feedingLoading = true;
    await updateFeedingItem({
      ...app.currentFeeding,
      end: dayjs().toDate(),
      type: feedingType
    });

    app.currentFeeding = null;
    localStorage.removeItem('baby-feeding-current-feeding');
    await refreshFeedingdata();

    resetTimer();
    feedingLoading = false;
  }

  $effect(() => {
    if (app.currentFeeding?.start) {
      startTimer(app.currentFeeding.start);
    }
  });

  onMount(async () => {
    app.user = getUser() ?? (await validateSignInResult());
    if (app.user) {
      await loadFeedingData();
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
  <div class="card my-8">
    <div class="relative card-body items-center gap-y-4">
      <InputFeedingType bind:group={feedingType} />
      <p class="text-8xl font-medium tracking-tight text-gray-600 font-stretch-condensed">
        {app.timer.format('HH:mm:ss')}
      </p>
      {#if app.timerId}
        <ButtonFeeding
          onclick={onEndFeeding}
          classes="btn-error"
          loading={!!app.feedingData && feedingLoading}
        >
          <span class="icon-[tabler--player-stop-filled] size-6 shrink-0"></span>
        </ButtonFeeding>
      {:else}
        <ButtonFeeding
          onclick={onStartFeeding}
          classes="btn-success"
          loading={!!app.feedingData && feedingLoading}
        >
          <span class="icon-[tabler--player-play-filled] size-6 shrink-0"></span>
        </ButtonFeeding>
      {/if}
      <button
        class="btn absolute right-6 bottom-6 btn-circle btn-outline btn-secondary"
        aria-label="Refresh Icon Button"
        onclick={refreshFeedingdata}
      >
        <span class="icon-[tabler--refresh] size-6 shrink-0"></span>
      </button>
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
    {#each Object.entries(feedingGroupByDay) as [date, items], index (date)}
      <div>
        <p>
          {dayjs(date).format('dddd D MMMM, YYYY')} ({items?.length} times)
        </p>
        <ProgressFeeding feedingItems={items} />
      </div>
      <ul class="timeline timeline-compact timeline-vertical mb-4 w-full timeline-snap-icon">
        {#each items as feeding}
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
              <div class="mb-2 pt-0.5 font-medium text-base-content">
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
              <p>
                Start at {dayjs(feeding.start).format('h:mm a')}.
              </p>
              {#if feeding.end}
                <p>End at {dayjs(feeding.end).format('h:mm a')}.</p>
              {/if}
            </div>
            <hr />
          </li>
        {/each}
      </ul>
    {/each}
  {/if}
{/if}
