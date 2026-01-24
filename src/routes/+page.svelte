<script lang="ts">
  import dayjs from 'dayjs';
  import { deleteFeedingItem, updateFeedingItem } from '$lib/services/firestore';
  import { refreshFeedingdata } from '$lib/services/feeding.svelte';
  import { app } from '$lib/stores/state.svelte';
  import type { FeedingItem, FeedingType } from '$lib/types';
  import FormLogin from '$lib/components/FormLogin.svelte';
  import InputFeedingType from '$lib/components/InputFeedingType.svelte';
  import ButtonFeeding from '$lib/components/ButtonFeeding.svelte';
  import ProgressFeeding from '$lib/components/ProgressFeeding.svelte';
  import RangeDateSlider from '$lib/components/RangeDateSlider.svelte';
  import ButtonRefresh from '$lib/components/ButtonRefresh.svelte';

  let loading = $state(false);
  let selected = $state<FeedingItem>();

  let feedingType = $derived<FeedingType>(app.currentFeeding?.type ?? 'breastmilk');
  let feedingGroupByDay = $derived(
    Object.groupBy(app.feedingData ?? [], (i) => dayjs(i.start).format('YYYY-MM-DD'))
  );

  function onUpdateTimeFrame([start, end]: number[]) {
    if (!selected) return;
    selected.start = dayjs(start).toDate();
    selected.end = dayjs(end).toDate();
  }

  async function onUpdate(current: FeedingItem, changes: FeedingItem) {
    if (!changes || JSON.stringify(changes) === JSON.stringify(current)) {
      selected = undefined;
      return;
    }
    await wrapRefreshData(updateFeedingItem({ ...changes }));
  }

  async function onDelete() {
    if (!selected?.id) return;
    await wrapRefreshData(deleteFeedingItem(selected.id));
  }

  async function wrapRefreshData(fn: Promise<void>) {
    loading = true;
    await fn;
    await refreshFeedingdata();
    loading = false;
    selected = undefined;
  }
</script>

{#if !app.user}
  <FormLogin />
{:else}
  <div class="card my-8 dark:border dark:border-b-gray-600">
    <div class="relative card-body items-center gap-y-4">
      <InputFeedingType bind:group={feedingType} />
      <p
        class="text-8xl font-medium tracking-tight text-gray-600 font-stretch-condensed dark:text-gray-300"
      >
        {app.timer.format('HH:mm:ss')}
      </p>
      <ButtonFeeding disabled={loading} />
      <ButtonRefresh disabled={loading} />
    </div>
  </div>
  {#if !app.feedingData}
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
                  {#if feeding.id === selected?.id}
                    <button class="btn btn-sm btn-error" onclick={onDelete} disabled={loading}>
                      Delete
                    </button>
                  {/if}
                </div>
                {#if feeding.id === selected?.id}
                  {#if loading}
                    <span class="loading loading-spinner"></span>
                  {:else}
                    <div>
                      <button
                        type="button"
                        aria-label="save"
                        onclick={() => onUpdate(feeding, { ...selected! })}
                      >
                        <span class="icon-[tabler--check] size-6"></span>
                      </button>
                      <button
                        type="button"
                        aria-label="cancel"
                        onclick={() => (selected = undefined)}
                      >
                        <span class="icon-[tabler--x] size-6"></span>
                      </button>
                    </div>
                  {/if}
                {:else if feeding.end}
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
                <RangeDateSlider {...feeding} onUpdate={onUpdateTimeFrame} />
              {/if}
            </div>
            <hr />
          </li>
        {/each}
      </ul>
    {/each}
  {/if}
{/if}
