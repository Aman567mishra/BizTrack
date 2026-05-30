import { useDataStore } from '../context/dataStore';
import { useAuthStore } from '../context/authStore';

/** Refresh caches only where data changed — not on every page navigation */
export async function syncAfterMutation(projectId = null) {
  useDataStore.getState().invalidateBusinessData(projectId);
  await useAuthStore.getState().refreshProfile();
  const user = useAuthStore.getState().user;
  if (user?.uid) {
    await useDataStore.getState().loadDashboard(user.uid, { force: true });
  }
}
