import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { api } from './api';
import { AuthStorage } from './auth-store';
import { DraftStore, EasyReceiptStore } from './db';

const SYNC_BANNER_KEY = 'easy_sync_banner';

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
 * Only syncs receipts belonging to the TRN that was active before the upgrade,
 * so that receipts from different easy-mode sessions don't cross into the wrong tenant.
 */
export async function syncEasyReceipts(): Promise<void> {
  if (isSyncing) return;

  const trn = await AuthStorage.getPendingSyncTrn();
  if (!trn) return; // No pending easy-mode session to sync

  const state = await NetInfo.fetch();
  if (!state.isConnected) return;

  const pending = await EasyReceiptStore.getPending(trn);
  if (pending.length === 0) {
    await AuthStorage.clearPendingSyncTrn();
    return;
  }

  isSyncing = true;
  try {
    const response = await api.post<{ synced: string[]; skipped: string[] }>(
      '/easy/sync',
      { receipts: pending }
    );

    const synced = response.synced ?? [];
    const all = [...synced, ...(response.skipped ?? [])];
    await EasyReceiptStore.markSynced(all);
    await AuthStorage.clearPendingSyncTrn();

    if (synced.length > 0) {
      await AsyncStorage.setItem(SYNC_BANNER_KEY, String(synced.length));
    }
  } catch {
    // Silently retry on next login
  } finally {
    isSyncing = false;
  }
}

export async function consumeSyncBanner(): Promise<number | null> {
  const val = await AsyncStorage.getItem(SYNC_BANNER_KEY);
  if (!val) return null;
  await AsyncStorage.removeItem(SYNC_BANNER_KEY);
  return parseInt(val, 10);
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
