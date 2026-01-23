import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('firebase/firestore', () => {
  return {
    addDoc: vi.fn(),
    collection: vi.fn((_, name: string) => `${name}-coll`),
    doc: vi.fn((coll, id?: string) => `doc:${coll}:${id}`),
    getDocs: vi.fn(),
    getFirestore: vi.fn(() => 'firestore-instance'),
    orderBy: vi.fn(),
    query: vi.fn((...args) => ({ args })),
    setDoc: vi.fn(),
    Timestamp: { fromDate: (d: Date) => ({ toDate: () => d }) },
    updateDoc: vi.fn(),
    where: vi.fn()
  };
});

vi.mock('./auth', () => ({ getUser: vi.fn(() => ({ uid: 'user-123' })) }));

import { addDoc, doc, getDocs, setDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { queryFeedingItems, addFeedingItem, updateFeedingItem, saveUser } from './firestore';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('firestore.ts - queryFeedingItems', () => {
  it('converts Timestamp to Date and returns items with id', async () => {
    const startDate = new Date('2020-01-01T00:00:00Z');
    const endDate = new Date('2020-01-01T01:00:00Z');

    vi.mocked(getDocs).mockResolvedValue({
      docs: [
        {
          id: '1',
          data: () => ({
            start: Timestamp.fromDate(startDate),
            end: Timestamp.fromDate(endDate),
            type: 'breast',
            note: 'note'
          })
        }
      ]
    } as never);

    const items = await queryFeedingItems(new Date('2019-12-31'), new Date('2020-02-01'));
    expect(getDocs).toHaveBeenCalled();
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('1');
    expect(items[0].start).toBeInstanceOf(Date);
    expect(+items[0].start).toBe(+startDate);
    expect(+items[0].end!).toBe(+endDate);
  });

  it('handles items without end date', async () => {
    const startDate = new Date('2020-01-01T00:00:00Z');

    vi.mocked(getDocs).mockResolvedValue({
      docs: [
        {
          id: '2',
          data: () => ({
            start: Timestamp.fromDate(startDate),
            end: null,
            type: 'formula',
            note: null
          })
        }
      ]
    } as never);

    const items = await queryFeedingItems(new Date('2019-12-31'), new Date('2020-02-01'));
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('2');
    expect(items[0].start).toBeInstanceOf(Date);
    expect(items[0].end).toBeUndefined();
  });

  it('returns empty array when no documents found', async () => {
    vi.mocked(getDocs).mockResolvedValue({
      docs: []
    } as never);

    const items = await queryFeedingItems(new Date('2019-12-31'), new Date('2020-02-01'));
    expect(items).toHaveLength(0);
  });

  it('handles multiple feeding types', async () => {
    const startDate1 = new Date('2020-01-01T00:00:00Z');
    const startDate2 = new Date('2020-01-01T02:00:00Z');

    vi.mocked(getDocs).mockResolvedValue({
      docs: [
        {
          id: '3',
          data: () => ({
            start: Timestamp.fromDate(startDate1),
            type: 'breastmilk'
          })
        },
        {
          id: '4',
          data: () => ({
            start: Timestamp.fromDate(startDate2),
            type: 'solid'
          })
        }
      ]
    } as never);

    const items = await queryFeedingItems(new Date('2019-12-31'), new Date('2020-02-01'));
    expect(items).toHaveLength(2);
    expect(items[0].type).toBe('breastmilk');
    expect(items[1].type).toBe('solid');
  });

  it('handles items with only start date (feeding in progress)', async () => {
    const startDate = new Date('2020-01-01T00:00:00Z');

    vi.mocked(getDocs).mockResolvedValue({
      docs: [
        {
          id: '5',
          data: () => ({
            start: Timestamp.fromDate(startDate),
            type: 'breastmilk'
            // no end date - feeding in progress
          })
        }
      ]
    } as never);

    const items = await queryFeedingItems(new Date('2019-12-31'), new Date('2020-02-01'));
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('5');
    expect(items[0].start).toBeInstanceOf(Date);
    expect(items[0].end).toBeUndefined();
  });
});

describe('firestore.ts - addFeedingItem', () => {
  it('calls addDoc with owner and returns item with id', async () => {
    const startDate = new Date('2020-01-02T00:00:00Z');
    const endDate = new Date('2020-01-02T01:00:00Z');
    const item = { start: startDate, end: endDate, type: 'bottle', note: 'n' };

    vi.mocked(addDoc).mockResolvedValue({ id: 'doc-1' } as never);
    const res = await addFeedingItem(item as never);

    expect(addDoc).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const callArgs = vi.mocked(addDoc).mock.calls[0] as any;
    expect(callArgs[0]).toBe('feeding-coll');
    expect(callArgs[1].owner).toBe('user-123');
    expect(res.id).toBe('doc-1');
    expect(res.start).toBe(startDate);
  });
});

describe('firestore.ts - updateFeedingItem', () => {
  it('calls updateDoc with converted timestamps', async () => {
    const startDate = new Date('2020-01-03T00:00:00Z');
    const endDate = new Date('2020-01-03T01:00:00Z');
    const item = { id: 'doc-2', start: startDate, end: endDate, type: 'combo', note: 'x' };

    vi.mocked(updateDoc).mockResolvedValue(null as never);
    await updateFeedingItem(item as never);

    expect(doc).toHaveBeenCalledWith('feeding-coll', 'doc-2');
    expect(updateDoc).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateArgs = vi.mocked(updateDoc).mock.calls[0][1] as any;
    expect(updateArgs.type).toBe('combo');
    expect(updateArgs.note).toBe('x');
  });
});

describe('firestore.ts - saveUser', () => {
  it('writes user data to users collection', async () => {
    vi.mocked(setDoc).mockResolvedValue(null as never);
    const user = { uid: 'u1', email: 'a@b.com', displayName: 'A', photoURL: 'p' };

    await saveUser(user);

    expect(doc).toHaveBeenCalledWith('users-coll', 'u1');
    expect(setDoc).toHaveBeenCalledWith(expect.any(String), {
      email: 'a@b.com',
      displayName: 'A',
      photoURL: 'p'
    });
  });

  it('handles user with null optional fields', async () => {
    vi.mocked(setDoc).mockResolvedValue(null as never);
    const user = { uid: 'u2', email: null, displayName: null, photoURL: null };

    await saveUser(user);

    expect(setDoc).toHaveBeenCalledWith(expect.any(String), {
      email: null,
      displayName: null,
      photoURL: null
    });
  });
});
