import dayjs from 'dayjs';
import { getUser } from './auth';
import { queryFeedingItems } from './firestore';
import type { AppState } from './types';

export const app = $state<AppState>({
  user: getUser(),
  feedingData: null,
  currentFeeding: null,
  timer: dayjs().startOf('day')
});

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

export function resetTimer() {
  clearInterval(app.timerId);
  app.timer = dayjs().startOf('day');
  app.timerId = undefined;
}

export function startTimer(startDate: Date) {
  clearInterval(app.timerId);
  app.timer = dayjs().startOf('day').add(dayjs().diff(startDate, 'second'), 'second');
  app.timerId = setInterval(() => {
    app.timer = app.timer.add(1, 'second');
  }, 1000);
}
