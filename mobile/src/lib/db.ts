import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('receipt_app.db');

export async function initDb() {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS offline_drafts (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid         TEXT    NOT NULL UNIQUE,
      customer_id  INTEGER NOT NULL,
      type         TEXT    NOT NULL DEFAULT '380',
      parent_id    INTEGER,
      amount       REAL    NOT NULL,
      payment_mode TEXT,
      description  TEXT,
      gps_lat      REAL,
      gps_long     REAL,
      created_at_local TEXT NOT NULL,
      synced       INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS cached_customers (
      id          INTEGER PRIMARY KEY,
      tenant_id   INTEGER NOT NULL,
      name        TEXT    NOT NULL,
      trn         TEXT,
      phone       TEXT,
      email       TEXT,
      address     TEXT,
      current_balance REAL DEFAULT 0,
      updated_at  TEXT
    );
  `);
}

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
  insert: async (draft: OfflineDraft) => {
    await db.runAsync(
      `INSERT OR IGNORE INTO offline_drafts
        (uuid, customer_id, type, parent_id, amount, payment_mode, description, gps_lat, gps_long, created_at_local)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        draft.uuid,
        draft.customer_id,
        draft.type,
        draft.parent_id ?? null,
        draft.amount,
        draft.payment_mode ?? null,
        draft.description ?? null,
        draft.gps_lat ?? null,
        draft.gps_long ?? null,
        draft.created_at_local,
      ]
    );
  },

  getPending: async (): Promise<OfflineDraft[]> => {
    return db.getAllAsync<OfflineDraft>(
      'SELECT * FROM offline_drafts WHERE synced = 0 ORDER BY created_at_local ASC'
    );
  },

  markSynced: async (uuids: string[]) => {
    if (uuids.length === 0) return;
    const placeholders = uuids.map(() => '?').join(',');
    await db.runAsync(
      `UPDATE offline_drafts SET synced = 1 WHERE uuid IN (${placeholders})`,
      uuids
    );
  },
};

export const CustomerCache = {
  upsertMany: async (customers: any[]) => {
    await db.withTransactionAsync(async () => {
      for (const c of customers) {
        await db.runAsync(
          `INSERT INTO cached_customers (id, tenant_id, name, trn, phone, email, address, current_balance, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             name=excluded.name, trn=excluded.trn, phone=excluded.phone,
             email=excluded.email, address=excluded.address,
             current_balance=excluded.current_balance, updated_at=excluded.updated_at`,
          [c.id, c.tenant_id, c.name, c.trn, c.phone, c.email, c.address, c.current_balance, c.updated_at]
        );
      }
    });
  },

  getAll: async () => {
    return db.getAllAsync<any>('SELECT * FROM cached_customers ORDER BY name ASC');
  },
};
