import dayjs from 'dayjs';
import type { AppState } from '$lib/types';
import { getUser } from '$lib/services/auth';

export const app = $state<AppState>({
  user: getUser(),
  feedingData: null,
  currentFeeding: null,
  timer: dayjs().startOf('day')
});
