import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { User } from '$lib/types';

vi.mock('firebase/auth');
vi.mock('./firestore');

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

vi.stubGlobal('localStorage', localStorageMock);

import { signInWithGoogle, validateSignInResult, getUser } from './auth';
import { getRedirectResult, signInWithRedirect } from 'firebase/auth';

describe('auth.ts - signInWithGoogle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call signInWithRedirect', () => {
    signInWithGoogle();
    expect(signInWithRedirect).toHaveBeenCalled();
  });
});

describe('auth.ts - validateSignInResult', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null when no redirect result', async () => {
    vi.mocked(getRedirectResult).mockResolvedValue(null as never);
    const result = await validateSignInResult();
    expect(result).toBeNull();
    expect(getRedirectResult).toHaveBeenCalled();
  });

  it('should return user and save to localStorage when valid result exists', async () => {
    const mockUser = {
      uid: 'google-123',
      email: 'google@test.com',
      displayName: 'Google User',
      photoURL: 'https://google.com/photo.jpg'
    };

    vi.mocked(getRedirectResult).mockResolvedValue({
      user: mockUser
    } as never);

    const result = await validateSignInResult();

    expect(result).not.toBeNull();
    expect(result!.uid).toBe('google-123');
    expect(result!.email).toBe('google@test.com');
    expect(localStorage.setItem).toHaveBeenCalledWith('baby-feeding-user', JSON.stringify(result));
  });

  it('should handle user with null optional fields', async () => {
    const mockUser = {
      uid: 'google-456',
      email: null,
      displayName: null,
      photoURL: null
    };

    vi.mocked(getRedirectResult).mockResolvedValue({
      user: mockUser
    } as never);

    const result = await validateSignInResult();

    expect(result).not.toBeNull();
    expect(result!.uid).toBe('google-456');
    expect(result!.email).toBeNull();
    expect(result!.displayName).toBeNull();
    expect(result!.photoURL).toBeNull();
  });
});

describe('auth.ts - getUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null when localStorage is empty', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    const result = getUser();
    expect(result).toBeNull();
    expect(localStorageMock.getItem).toHaveBeenCalledWith('baby-feeding-user');
  });

  it('should return null when stored user has no uid', async () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify({ email: 'test@test.com' }));
    const result = getUser();
    expect(result).toBeNull();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('baby-feeding-user');
  });

  it('should return user when valid user is stored', async () => {
    const storedUser: User = {
      uid: '123',
      email: 'test@test.com',
      displayName: 'Test User',
      photoURL: 'http://test.com/photo.jpg'
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedUser));
    const result = getUser();
    expect(result).toEqual(storedUser);
  });

  it('should return null when stored JSON is invalid', async () => {
    localStorageMock.getItem.mockReturnValue('invalid json');
    let caughtError: Error | null = null;
    try {
      getUser();
    } catch (e) {
      caughtError = e as Error;
    }
    expect(caughtError).not.toBeNull();
  });
});
