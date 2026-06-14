import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('smart_business.db');

const runSql = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        sql,
        params,
        (_, result) => resolve(result),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });

const generateId = () =>
  `${Date.now()}-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`;

const addColumnIfMissing = async (sql) => {
  try {
    await runSql(sql);
  } catch (error) {
    if (!String(error.message || error).includes('duplicate column')) {
      throw error;
    }
  }
};

export const initDB = async () => {
  await runSql(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      payment_method TEXT NOT NULL,
      mobile_money_ref TEXT,
      date TEXT NOT NULL,
      is_synced INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);
  await addColumnIfMissing('ALTER TABLE transactions ADD COLUMN description TEXT;');
  await addColumnIfMissing('ALTER TABLE transactions ADD COLUMN mobile_money_ref TEXT;');
  await runSql('CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions (user_id, date DESC);');
  await runSql('CREATE INDEX IF NOT EXISTS idx_transactions_sync ON transactions (user_id, is_synced);');
};

export const addTransaction = async ({ userId, type, amount, category, description = null, paymentMethod, mobileMoneyRef = null, date }) => {
  const id = generateId();
  const createdAt = new Date().toISOString();

  await runSql(
    `INSERT INTO transactions
      (id, user_id, type, amount, category, description, payment_method, mobile_money_ref, date, is_synced, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
    [id, userId, type, amount, category, description, paymentMethod, mobileMoneyRef, date, createdAt]
  );

  return { id, userId, type, amount, category, description, paymentMethod, mobileMoneyRef, date, isSynced: false };
};

const mapTransaction = (row) => ({
  id: row.id,
  userId: row.user_id,
  type: row.type,
  amount: Number(row.amount),
  category: row.category,
  description: row.description,
  paymentMethod: row.payment_method,
  mobileMoneyRef: row.mobile_money_ref,
  date: row.date,
  isSynced: row.is_synced === 1,
});

export const getAllTransactions = async (userId) => {
  const result = await runSql(
    'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC',
    [userId]
  );
  return result.rows._array.map(mapTransaction);
};

export const getUnsyncedTransactions = async (userId) => {
  const result = await runSql(
    'SELECT * FROM transactions WHERE user_id = ? AND is_synced = 0 ORDER BY date ASC',
    [userId]
  );
  return result.rows._array.map(mapTransaction);
};

export const markTransactionsAsSynced = async (ids) => {
  if (!ids || ids.length === 0) return;

  await Promise.all(
    ids.map((id) => runSql('UPDATE transactions SET is_synced = 1 WHERE id = ?', [id]))
  );
};
