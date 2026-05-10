import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { resolve } from 'path';
import { app } from 'electron';
import * as schema from './schema';
import log from 'electron-log/main';

const dbPath = resolve(app.getPath('userData'), 'quickclip.db');
const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });

export const initLocalDb = () => {
  log.info('Initializing Local SQLite database at:', dbPath);
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      created_at INTEGER
    );
    CREATE TABLE IF NOT EXISTS clips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      content TEXT NOT NULL,
      created_at INTEGER,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);
};
