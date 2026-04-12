// Web shim — SQLite offline storage is native-only.
// On web the app talks directly to the API with no local persistence.

export async function initDb() {}

export interface OfflineDraft {
  uuid: string;
  customer_id: number;
  type: '380' | '381';
  parent_id?: number | null;
  amount: number;
  payment_mode?: string | null;
  description?: string | null;
  gps_lat?: number | null;
  gps_long?: number | null;
  created_at_local: string;
}

export const DraftStore = {
  insert: async (_draft: OfflineDraft) => {},
  getPending: async (): Promise<OfflineDraft[]> => [],
  markSynced: async (_uuids: string[]) => {},
};

export const CustomerCache = {
  upsertMany: async (_customers: any[]) => {},
  getAll: async (): Promise<any[]> => [],
};
