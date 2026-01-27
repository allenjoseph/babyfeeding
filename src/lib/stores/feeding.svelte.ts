import type { Feeding } from '$lib/types';
import { deleteFeedingItem, updateFeedingItem } from '$lib/services/firestore';
import { refreshFeedingdata } from '$lib/services/feeding.svelte';

interface FeedingState {
  loading: boolean;
  selected: Feeding | undefined;
  onUpdate: (current: Feeding, changes: Feeding) => Promise<void>;
  onDelete: () => Promise<void>;
}

export const feedingState = $state<FeedingState>({
  loading: false,
  selected: undefined,
  onUpdate: async (current: Feeding, changes: Feeding) => {
    if (!changes || JSON.stringify(changes) === JSON.stringify(current)) {
      feedingState.selected = undefined;
      return;
    }
    await wrapRefreshData(updateFeedingItem({ ...changes }));
  },
  onDelete: async () => {
    if (!feedingState.selected?.id) return;
    await wrapRefreshData(deleteFeedingItem(feedingState.selected.id));
  }
});

async function wrapRefreshData(fn: Promise<void>) {
  feedingState.loading = true;
  await fn;
  await refreshFeedingdata();
  feedingState.loading = false;
  feedingState.selected = undefined;
}
