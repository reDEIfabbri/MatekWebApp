import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { initializeDatabase } from './database.js';

const topics = [
  "Számrendszerek",
  "Fejszámolás alapműveletekkel",
  "Írásbeli műveletek",
  "Írásbeli osztás",
  "Római számok",
  "Halmazok",
  "Kombinatorika",
  "Összeadás, kivonás az egészszámok halmazán",
  "Szorzás, osztás az egészszámok halmazán",
  "Számok abszolutértéke és ellentetje",
  "Arányosságok",
  "Nyitot mondatok",
  "Szöveges feladatok szimpla",
  "Szöveges feladatok komlpex",
  "Alap dimenziók",
  "Származtatott mértékegységek",
  "Törtek értelmezése",
  "Törtek összeadása, kivonása",
  "Törtek szorzása, osztása",
  "Tizedestörtek értelmezése",
  "Tizedestörtek összeadása, kivonása",
  "Tizedestörtek szorzása, osztása",
  "Kordináta-rendszerek és diagramok",
  "Geometriai axiómák, alapfogalmak",
  "Geometriai szerkesztések",
  "Sík geometriai számítások",
  "Tér geometriai 2D-s számítások",
  "Tér geometriai 3D-s számítások"
];

const sampleTasks = [
  {
    topicName: "Fejszámolás alapműveletekkel",
    difficulty: 1.0,
    taskType: 'TEXT_ANSWER',
    taskText: "Mennyi 12 + 15?",
    correctAnswer: "27"
  },
  {
    topicName: "Fejszámolás alapműveletekkel",
    difficulty: 1.5,
    taskType: 'TEXT_ANSWER',
    taskText: "Számold ki: 8 * 7",
    correctAnswer: "56"
  },
  {
    topicName: "Számrendszerek",
    difficulty: 2.0,
    taskType: 'TEXT_ANSWER',
    taskText: "Írd át 10-es számrendszerbe a 1010 kettes számrendszerbeli számot!",
    correctAnswer: "10"
  },
  {
    topicName: "Nyitot mondatok",
    difficulty: 2.5,
    taskType: 'TEXT_ANSWER',
    taskText: "Oldd meg az egyenletet: 2x + 5 = 15",
    correctAnswer: "5"
  },
  {
    topicName: "Törtek összeadása, kivonása",
    difficulty: 3.0,
    taskType: 'TEXT_ANSWER',
    taskText: "Mennyi 1/2 + 1/4? (Kérlek egyszerűsített formában add meg, pl. 3/4)",
    correctAnswer: "3/4"
  }
];

async function seed() {
  // Always run initializeDatabase first to ensure schema changes (like adding task_type) are applied
  console.log('Initializing database schema...');
  const db = await initializeDatabase();

  console.log('Seeding topics...');

  for (const topic of topics) {
    try {
      // Check if exists first to avoid duplicates if run multiple times
      const exists = await db.get('SELECT topic_id FROM TOPICS WHERE name = ?', [topic]);
      if (!exists) {
        await db.run('INSERT INTO TOPICS (name) VALUES (?)', [topic]);
        console.log(`Inserted topic: ${topic}`);
      }
    } catch (err) {
      console.error(`Error inserting topic ${topic}:`, err);
    }
  }

  console.log('Seeding sample tasks...');

  for (const task of sampleTasks) {
    try {
       // Find the topic ID
       const topicRow = await db.get('SELECT topic_id FROM TOPICS WHERE name = ?', [task.topicName]);
       if (topicRow) {
           const topicId = topicRow.topic_id;
           
           // Check if task exists to prevent duplicates
           const taskExists = await db.get('SELECT task_id FROM TASKS WHERE task_text = ?', [task.taskText]);
           
           if (!taskExists) {
               await db.run(
                   'INSERT INTO TASKS (topic_id, difficulty, task_type, task_text, correct_answer) VALUES (?, ?, ?, ?, ?)',
                   [topicId, task.difficulty, task.taskType, task.taskText, task.correctAnswer]
               );
               console.log(`Inserted task: ${task.taskText}`);
           } else {
               console.log(`Skipped task (exists): ${task.taskText}`);
           }
       } else {
           console.error(`Could not find topic ID for: ${task.topicName}`);
       }
    } catch(err) {
        console.error(`Error inserting task: ${task.taskText}`, err);
    }
  }

  console.log('Seeding complete.');
}

seed();