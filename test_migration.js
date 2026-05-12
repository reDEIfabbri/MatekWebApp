import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { initializeDatabase } from './server/database.js';

async function test() {
  await initializeDatabase();
  console.log("Migration done");
}
test();