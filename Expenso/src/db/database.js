const path = require('path');
const Database = require('better-sqlite3');
const logger = require('../utils/logger');

const dbPath = path.join(__dirname, '..', '..', 'expenses.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    amount REAL NOT NULL CHECK (amount > 0),
    category TEXT NOT NULL CHECK (category IN ('Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Other')),
    date TEXT NOT NULL DEFAULT (date('now', 'localtime')),
    note TEXT,
    receipt_image TEXT,
    scanned_text TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);
  CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
  CREATE INDEX IF NOT EXISTS idx_expenses_title ON expenses(title);
`);

const columns = db.prepare('PRAGMA table_info(expenses)').all();
const migrations = [
  { column: 'receipt_image', sql: 'ALTER TABLE expenses ADD COLUMN receipt_image TEXT' },
  { column: 'scanned_text', sql: 'ALTER TABLE expenses ADD COLUMN scanned_text TEXT' }
];

migrations.forEach((migration) => {
  const hasColumn = columns.some((column) => column.name === migration.column);
  if (!hasColumn) {
    db.prepare(migration.sql).run();
    logger.info('Database migrated', { migration: `add ${migration.column} to expenses` });
  }
});

logger.info('Database initialized', { path: dbPath, journalMode: 'WAL' });

module.exports = db;
