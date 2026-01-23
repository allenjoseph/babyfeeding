import { getAuth, getRedirectResult, GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
import { firebaseApp } from '$lib/firebase';
import type { User } from '$lib/types';
import { saveUser } from './firestore';

const auth = getAuth(firebaseApp);
const provider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  return signInWithRedirect(auth, provider);
}

export async function validateSignInResult(): Promise<User | null> {
  const result = await getRedirectResult(auth);
  if (result?.user) {
    const user: User = {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL
    };
    await saveUser(user);
    localStorage.setItem('baby-feeding-user', JSON.stringify(user));
    return user;
  }
  return null;
}

export function getUser() {
  const user: User = JSON.parse(localStorage.getItem('baby-feeding-user') ?? 'null');
  if (!user?.uid) {
    localStorage.removeItem('baby-feeding-user');
    return null;
  }
  return user;
}
