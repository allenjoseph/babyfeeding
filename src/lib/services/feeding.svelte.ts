import dayjs from 'dayjs';
import type { FeedingType } from '$lib/types';
import { app } from '$lib/stores/state.svelte';
import { addFeedingItem, queryFeedingItems, updateFeedingItem } from './firestore';

export async function startFeeding(feedingType: FeedingType) {
  app.currentFeeding = await addFeedingItem({
    start: dayjs().toDate(),
    type: feedingType
  });

  localStorage.setItem('baby-feeding-current-feeding', JSON.stringify(app.currentFeeding));
  await refreshFeedingdata();
}

export async function endFeeding(feedingType?: FeedingType) {
  if (!app.currentFeeding) return;

  await updateFeedingItem({
    ...app.currentFeeding,
    end: dayjs().toDate(),
    type: feedingType ?? app.currentFeeding.type
  });

  app.currentFeeding = null;
  localStorage.removeItem('baby-feeding-current-feeding');
  await refreshFeedingdata();

  resetTimer();
}

export async function refreshFeedingdata() {
  app.feedingData = await fetchFeedingData();

  const feedingInProgress = app.feedingData.find((i) => !i.end);
  if (feedingInProgress) {
    app.currentFeeding = feedingInProgress;
    localStorage.setItem('baby-feeding-current-feeding', JSON.stringify(app.currentFeeding));
    startTimer(app.currentFeeding.start);
  }
}

async function fetchFeedingData() {
  const from = dayjs().subtract(3, 'day').toDate(); // one week ago
  const to = dayjs().toDate(); // today
  return queryFeedingItems(from, to);
}

export function startTimer(startDate: Date) {
  clearInterval(app.timerId);
  app.timer = dayjs().startOf('day').add(dayjs().diff(startDate, 'second'), 'second');
  app.timerId = setInterval(() => {
    app.timer = app.timer.add(1, 'second');
  }, 1000);
}

export function resetTimer() {
  clearInterval(app.timerId);
  app.timer = dayjs().startOf('day');
  app.timerId = undefined;
}
