import { initializeApp } from 'firebase/app';

export const app = initializeApp(JSON.parse(atob(import.meta.env.VITE_FIREBASE_CONFIG)));
