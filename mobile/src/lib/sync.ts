import NetInfo from '@react-native-community/netinfo';
import { api } from './api';
import { DraftStore, EasyReceiptStore } from './db';

let isSyncing = false;

export async function syncPendingDrafts(force = false): Promise<void> {
  if (isSyncing) return;

  if (!force) {
    const state = await NetInfo.fetch();
    if (!state.isConnected) return;
  }

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
  } catch (e) {
    console.warn('[sync] syncPendingDrafts failed:', e);
  } finally {
    isSyncing = false;
  }
}

/**
 * Syncs easy-mode receipts after the user logs in to a full tenant account.
 * Called once on the first full login following an easy-mode upgrade.
 */
export async function syncEasyReceipts(): Promise<void> {
  if (isSyncing) return;

  const state = await NetInfo.fetch();
  if (!state.isConnected) return;

  const pending = await EasyReceiptStore.getPending();
  if (pending.length === 0) return;

  isSyncing = true;
  try {
    const response = await api.post<{ synced: string[]; skipped: string[] }>(
      '/easy/sync',
      { receipts: pending }
    );

    const all = [...(response.synced ?? []), ...(response.skipped ?? [])];
    await EasyReceiptStore.markSynced(all);
  } catch {
    // Silently retry on next call
  } finally {
    isSyncing = false;
  }
}

/**
 * Subscribe to network changes and auto-sync when back online.
 * Call once at app startup (full mode only).
 */
export function startSyncListener(): () => void {
  return NetInfo.addEventListener((state) => {
    if (state.isConnected) {
      syncPendingDrafts();
    }
  });
}
