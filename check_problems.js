import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function check() {
  const db = await open({
    filename: './matekwebapp.db',
    driver: sqlite3.Database
  });

  try {
    const problems = await db.all('SELECT task_id, topic_id, difficulty, task_type, task_text, choices FROM TASKS');
    console.log('Problems query success. Count:', problems.length);
  } catch (err) {
    console.error('Error querying problems:', err.message);
  }
}
check();