import NetInfo from '@react-native-community/netinfo';
import { api } from './api';
import { DraftStore } from './db';

let isSyncing = false;

export async function syncPendingDrafts(): Promise<void> {
  if (isSyncing) return;

  const state = await NetInfo.fetch();
  if (!state.isConnected) return;

  const pending = await DraftStore.getPending();
  if (pending.length === 0) return;

  isSyncing = true;
  try {
    const response = await api.post<{ synced: string[]; skipped: string[] }>(
      '/documents/sync',
      { documents: pending }
    );

    const syncedUuids = [...(response.synced ?? []), ...(response.skipped ?? [])];
    await DraftStore.markSynced(syncedUuids);
  } catch {
    // Silently retry on next sync trigger
  } finally {
    isSyncing = false;
  }
}

/**
 * Subscribe to network changes and auto-sync when back online.
 * Call once at app startup.
 */
export function startSyncListener(): () => void {
  return NetInfo.addEventListener((state) => {
    if (state.isConnected) {
      syncPendingDrafts();
    }
  });
}
