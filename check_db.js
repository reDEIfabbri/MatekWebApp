import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function check() {
  const db = await open({
    filename: './matekwebapp.db',
    driver: sqlite3.Database
  });

  const tasks = await db.all('SELECT * FROM TASKS');
  console.log('Tasks in DB:', tasks.length);
  console.log(tasks);
}
check();