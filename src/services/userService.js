import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { COLLECTIONS } from '../utils/constants';
import { emptyUserSummary } from '../utils/calculations';
import { firestoreCall } from '../utils/network';

export async function ensureUserProfile(user) {
  const ref = doc(db, COLLECTIONS.USERS, user.uid);
  const snap = await firestoreCall(() => getDoc(ref), 'user profile');
  if (!snap.exists()) {
    await firestoreCall(
      () =>
        setDoc(ref, {
      email: user.email || '',
      displayName: user.displayName || '',
      businessName: '',
      phone: '',
      ...emptyUserSummary(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
        }),
      'create user profile'
    );
  }
  return getUserProfile(user.uid);
}

export async function getUserProfile(uid) {
  const snap = await firestoreCall(
    () => getDoc(doc(db, COLLECTIONS.USERS, uid)),
    'user profile'
  );
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function updateUserProfile(uid, data) {
  const ref = doc(db, COLLECTIONS.USERS, uid);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

/** Adjust dashboard summary deltas (called after project/totals change) */
export async function adjustUserSummary(uid, deltas) {
  const ref = doc(db, COLLECTIONS.USERS, uid);
  const payload = { updatedAt: serverTimestamp() };
  const fields = [
    'totalProjects',
    'totalReceived',
    'totalExpenses',
    'totalPending',
    'totalProfit',
    'totalSplit',
  ];
  fields.forEach((key) => {
    if (deltas[key] !== undefined && deltas[key] !== 0) {
      payload[key] = increment(deltas[key]);
    }
  });
  if (Object.keys(payload).length > 1) {
    await updateDoc(ref, payload);
  }
}

export async function recalcUserSummaryFromProjects(uid, projects) {
  const summary = projects.reduce(
    (acc, p) => {
      acc.totalProjects += 1;
      acc.totalReceived += Number(p.totalReceived || 0);
      acc.totalExpenses += Number(p.totalExpenses || 0);
      acc.totalPending += Number(p.totalPending || 0);
      acc.totalProfit += Number(p.totalProfit || 0);
      acc.totalSplit += Number(p.totalSplit || 0);
      return acc;
    },
    emptyUserSummary()
  );
  const ref = doc(db, COLLECTIONS.USERS, uid);
  await updateDoc(ref, { ...summary, updatedAt: serverTimestamp() });
  return summary;
}
