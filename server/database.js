import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Open the database connection
const dbPromise = open({
  filename: './matekwebapp.db',
  driver: sqlite3.Database
});

async function initializeDatabase() {
  const db = await dbPromise;

  await db.exec(`
    CREATE TABLE IF NOT EXISTS USERS (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      username TEXT,
      role TEXT CHECK(role IN ('STUDENT', 'ADMIN')) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS TOPICS (
      topic_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS TASKS (
      task_id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic_id INTEGER,
      difficulty REAL,
      task_type TEXT CHECK(task_type IN ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TEXT_ANSWER')) NOT NULL DEFAULT 'TEXT_ANSWER',
      task_text TEXT,
      choices TEXT, -- JSON array for MC/SC questions
      correct_answer TEXT,
      FOREIGN KEY (topic_id) REFERENCES TOPICS(topic_id)
    );

    CREATE TABLE IF NOT EXISTS USER_TOPIC_STATS (
      stat_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      topic_id INTEGER,
      proficiency_score REAL,
      FOREIGN KEY (user_id) REFERENCES USERS(user_id),
      FOREIGN KEY (topic_id) REFERENCES TOPICS(topic_id)
    );

    CREATE TABLE IF NOT EXISTS USER_DIFFICULTY_STATS (
      stat_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      topic_id INTEGER,
      difficulty REAL,
      attempts INTEGER DEFAULT 0,
      correct_answers INTEGER DEFAULT 0,
      UNIQUE(user_id, topic_id, difficulty),
      FOREIGN KEY (user_id) REFERENCES USERS(user_id),
      FOREIGN KEY (topic_id) REFERENCES TOPICS(topic_id)
    );

    CREATE TABLE IF NOT EXISTS USER_GLOBAL_STATS (
      global_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      lives INTEGER,
      current_streak INTEGER,
      total_problems_solved INTEGER DEFAULT 0,
      correct_answers INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES USERS(user_id)
    );
  `);

  // Migration: Add username column if the table was created before it was added to the schema
  try {
    await db.exec(`ALTER TABLE USERS ADD COLUMN username TEXT;`);
    console.log('Migrated USERS table: added username column.');
  } catch (err) {
    if (!err.message.includes('duplicate column name')) {
      console.error('Migration error:', err.message);
    }
  }

  // Migration: Add task_type column if the table was created before it was added to the schema
  try {
    // Sqlite doesn't support IF NOT EXISTS in ALTER TABLE add column easily, so we just catch the error
    // if the column already exists
    await db.exec(`ALTER TABLE TASKS ADD COLUMN task_type TEXT CHECK(task_type IN ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TEXT_ANSWER')) NOT NULL DEFAULT 'TEXT_ANSWER';`);
    console.log('Migrated TASKS table: added task_type column.');
  } catch (err) {
    if (!err.message.includes('duplicate column name')) {
      console.error('Migration error:', err.message);
    }
  }
  
  // Migration: Add choices column if the table was created before it was added to the schema
  try {
    await db.exec(`ALTER TABLE TASKS ADD COLUMN choices TEXT;`);
    console.log('Migrated TASKS table: added choices column.');
  } catch (err) {
    if (!err.message.includes('duplicate column name')) {
      console.error('Migration error:', err.message);
    }
  }

  // Migration: Add total_problems_solved and correct_answers to USER_GLOBAL_STATS
  try {
    await db.exec(`ALTER TABLE USER_GLOBAL_STATS ADD COLUMN total_problems_solved INTEGER DEFAULT 0;`);
    console.log('Migrated USER_GLOBAL_STATS table: added total_problems_solved column.');
  } catch (err) {
    if (!err.message.includes('duplicate column name')) {
      console.error('Migration error:', err.message);
    }
  }
  try {
    await db.exec(`ALTER TABLE USER_GLOBAL_STATS ADD COLUMN correct_answers INTEGER DEFAULT 0;`);
    console.log('Migrated USER_GLOBAL_STATS table: added correct_answers column.');
  } catch (err) {
    if (!err.message.includes('duplicate column name')) {
      console.error('Migration error:', err.message);
    }
  }

  console.log('Database initialized successfully.');
  return db;
}

export { dbPromise, initializeDatabase };