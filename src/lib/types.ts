import type { Dayjs } from 'dayjs';

export type FeedingType = 'breastmilk' | 'formula' | 'solid';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface FeedingItem {
  id?: string;
  start: Date;
  end?: Date;
  type: FeedingType;
  note?: string;
}

export interface AppState {
  user: User | null;
  feedingData: FeedingItem[] | null;
  currentFeeding: FeedingItem | null;
  timer: Dayjs;
  timerId?: NodeJS.Timeout;
}
