import {
  addDoc,
  collection,
  doc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { app } from './firebase';
import { getUser } from './auth';
import type { FeedingItem } from './types';
import type { User } from 'firebase/auth';

const firestore = getFirestore(app);
const feedingCollection = collection(firestore, 'feeding');
const userCollection = collection(firestore, 'users');

export async function queryFeedingItems(from: Date, to: Date) {
  const snapshot = await getDocs(
    query(
      feedingCollection,
      where('owner', '==', getUser()?.uid),
      where('start', '>=', Timestamp.fromDate(from)),
      where('start', '<', Timestamp.fromDate(to)),
      orderBy('start', 'desc')
    )
  );

  return snapshot.docs.map((item) => {
    const data = item.data();
    data.start = (data.start as Timestamp).toDate();
    data.end = (data.end as Timestamp)?.toDate();
    return { id: item.id, ...data };
  }) as FeedingItem[];
}

export async function addFeedingItem(item: FeedingItem) {
  const feedingDoc = {
    ...item,
    start: Timestamp.fromDate(item.start),
    owner: getUser()?.uid
  };

  return addDoc(feedingCollection, feedingDoc).then<FeedingItem>((i) => ({ id: i.id, ...item }));
}

export async function updateFeedingItem(item: FeedingItem) {
  const feedingDoc = {
    start: Timestamp.fromDate(item.start),
    end: Timestamp.fromDate(item.end!),
    type: item.type,
    note: item.note ?? ''
  };

  return updateDoc(doc(feedingCollection, item.id), feedingDoc);
}

export async function saveUser(user: Partial<User>) {
  const userDocRef = doc(userCollection, user.uid!);
  const userDocData = {
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL
  };
  await setDoc(userDocRef, userDocData);
}
