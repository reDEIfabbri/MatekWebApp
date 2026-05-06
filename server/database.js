import sqlite3 from 'sqlite3';
import {open} from 'sqlite';

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
      task_type TEXT CHECK(task_type IN ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TEXT_ANSWER')) NOT NULL,
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

    CREATE TABLE IF NOT EXISTS USER_GLOBAL_STATS (
      global_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      lives INTEGER,
      current_streak INTEGER,
      FOREIGN KEY (user_id) REFERENCES USERS(user_id)
    );
  `);

    console.log('Database initialized successfully.');
    return db;
}

export {dbPromise, initializeDatabase};
