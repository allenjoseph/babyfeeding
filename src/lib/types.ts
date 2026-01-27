import type { Dayjs } from 'dayjs';

export type feedingType = 'breastmilk' | 'formula' | 'solid';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface Feeding {
  id?: string;
  start: Date;
  end?: Date;
  type: feedingType;
  note?: string;
}

export interface AppState {
  user: User | null;
  feedingData: Feeding[] | null;
  currentFeeding: Feeding | null;
  timer: Dayjs;
  timerId?: NodeJS.Timeout;
}
