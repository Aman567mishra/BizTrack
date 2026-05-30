import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { useDataStore } from './dataStore';
import { ensureUserProfile, getUserProfile } from '../services/userService';
import {
  reconnectFirestore,
  getFirestoreUserMessage,
  isBrowserOffline,
} from '../utils/network';

async function loadUserProfile(user, retried = false) {
  await reconnectFirestore();

  try {
    await ensureUserProfile(user);
    const profile = await getUserProfile(user.uid);
    return { profile, error: null, offline: false };
  } catch (err) {
    const msg = String(err?.message || '').toLowerCase();
    const shouldRetry =
      !retried &&
      !isBrowserOffline() &&
      (err?.code === 'unavailable' || msg.includes('offline'));

    if (shouldRetry) {
      await reconnectFirestore();
      return loadUserProfile(user, true);
    }

    return {
      profile: null,
      error: getFirestoreUserMessage(err),
      offline: isBrowserOffline(),
    };
  }
}

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  profileLoading: false,
  loading: true,
  error: null,
  offline: false,

  init: () => {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        // Unblock UI immediately — don't wait 1–2 min for Firestore
        set({
          user,
          loading: false,
          profileLoading: true,
          error: null,
        });

        loadUserProfile(user)
          .then((result) => {
            set({ ...result, profileLoading: false });
          })
          .catch((err) => {
            set({
              profile: null,
              profileLoading: false,
              error: getFirestoreUserMessage(err),
              offline: isBrowserOffline(),
            });
          });
      } else {
        set({
          user: null,
          profile: null,
          profileLoading: false,
          loading: false,
          error: null,
          offline: false,
        });
      }
    });
  },

  retryConnection: async () => {
    const { user } = get();
    if (!user) return;
    set({ profileLoading: true, error: null });
    try {
      const result = await loadUserProfile(user);
      set({ ...result, profileLoading: false });
    } catch (err) {
      set({
        profileLoading: false,
        error: getFirestoreUserMessage(err),
        offline: isBrowserOffline(),
      });
    }
  },

  login: async (email, password) => {
    set({ error: null, offline: false });
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      set({ user: cred.user, loading: false, profileLoading: true });
      const result = await loadUserProfile(cred.user);
      set({ ...result, profileLoading: false });
      return cred.user;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  register: async (email, password, displayName) => {
    set({ error: null, offline: false });
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }
      set({ user: cred.user, loading: false, profileLoading: true });
      const result = await loadUserProfile(cred.user);
      set({ ...result, profileLoading: false });
      return cred.user;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  logout: async () => {
    await signOut(auth);
    useDataStore.getState().clearAll();
    set({
      user: null,
      profile: null,
      profileLoading: false,
      error: null,
      offline: false,
    });
  },

  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;
    set({ profileLoading: true });
    const result = await loadUserProfile(user);
    set({ ...result, profileLoading: false });
  },

  clearError: () => set({ error: null, offline: false }),

  setProfile: (profile) => set({ profile }),
}));
