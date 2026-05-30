import { enableNetwork } from 'firebase/firestore';
import { db, firebaseProjectId } from '../firebase/config';

export const FIRESTORE_TIMEOUT_MS = 12_000;

export function withTimeout(promise, ms = FIRESTORE_TIMEOUT_MS, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(
          Object.assign(new Error(message || `Request timed out after ${ms / 1000}s`), {
            code: 'timeout',
          })
        );
      }, ms);
    }),
  ]);
}

/** Wrap any Firestore read/write so it fails fast instead of hanging 1–2 minutes */
export function firestoreCall(fn, label = 'request') {
  return withTimeout(
    Promise.resolve().then(fn),
    FIRESTORE_TIMEOUT_MS,
    `Firestore ${label} timed out. Check Firebase Console for project "${firebaseProjectId}".`
  );
}

export async function reconnectFirestore() {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return false;
  }
  try {
    await withTimeout(enableNetwork(db), 5000, 'Reconnect timed out');
    return true;
  } catch {
    return false;
  }
}

export function isBrowserOffline() {
  return typeof navigator !== 'undefined' && !navigator.onLine;
}

export function getFirestoreUserMessage(err) {
  const code = err?.code;
  const msg = String(err?.message || '');

  if (isBrowserOffline()) {
    return 'Your browser reports no network. Check Wi‑Fi and try again.';
  }

  if (code === 'timeout' || msg.includes('timed out')) {
    return `Firebase is not responding (waited ${FIRESTORE_TIMEOUT_MS / 1000}s). Open Firebase Console → Firestore → create database for "${firebaseProjectId}", enable Email auth, then deploy rules.`;
  }

  if (code === 'permission-denied') {
    return `Firestore access denied for "${firebaseProjectId}". Create the database and run: firebase deploy --only firestore`;
  }

  if (
    msg.includes('does not exist') ||
    msg.includes('NOT_FOUND') ||
    msg.includes('Cloud Firestore API has not been used')
  ) {
    return `Firestore is not set up for "${firebaseProjectId}". Firebase Console → Build → Firestore → Create database.`;
  }

  if (code === 'unavailable' || msg.toLowerCase().includes('client is offline')) {
    return 'Cannot reach Firebase. Disable VPN/ad-blocker, click Retry, or use a different network.';
  }

  if (code === 'failed-precondition' && msg.includes('index')) {
    return 'Firestore index missing. Run: firebase deploy --only firestore';
  }

  const cleaned = msg.replace(/^Firebase:\s*/i, '').trim();
  return cleaned || 'Could not load data from Firebase. Press F12 and check the Console tab.';
}
