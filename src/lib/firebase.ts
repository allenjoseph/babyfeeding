import { initializeApp } from 'firebase/app';

export const firebaseApp = initializeApp(JSON.parse(atob(import.meta.env.VITE_FIREBASE_CONFIG)));
