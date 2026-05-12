import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcrypt';
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
  "Származtat mértékegységek",
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

function generateSampleTasks(topicName) {
    const tasks = [];
    const difficulties = [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0];
    
    difficulties.forEach((diff, index) => {
        let taskText = "";
        let correctAnswer = "";
        
        const a = Math.floor(diff) * 3;
        const b = index + 2;

        if (topicName.includes("Törtek")) {
            taskText = `\\frac{${a}}{${b}} + \\frac{1}{${b}}`;
            correctAnswer = `${a + 1}/${b}`;
        } else if (topicName.includes("Nyitot") || topicName.includes("egyenlet")) {
            taskText = `${a}x + ${b} = ${a * 2 + b}`;
            correctAnswer = `2`;
        } else if (topicName.includes("Szorzás") || topicName.includes("osztás")) {
            taskText = `${a} \\times ${b}`;
            correctAnswer = `${a * b}`;
        } else {
            taskText = `${a} + ${b}`;
            correctAnswer = `${a + b}`;
        }

        tasks.push({
            topicName: topicName,
            difficulty: diff,
            taskType: 'TEXT_ANSWER',
            taskText: taskText,
            correctAnswer: correctAnswer
        });
    });
    return tasks;
}

const defaultUsers = [
  { email: 'admin@matek.test', password: 'password', role: 'ADMIN' },
  { email: 'student@matek.test', password: 'password', role: 'STUDENT' }
];

async function seed() {
  console.log('Initializing database schema...');
  const db = await initializeDatabase();

  console.log('Clearing existing tasks for clean re-seed...');
  await db.run('DELETE FROM TASKS');
  await db.run('DELETE FROM USER_DIFFICULTY_STATS');

  console.log('Seeding default users...');
  for (const user of defaultUsers) {
    try {
      const exists = await db.get('SELECT user_id FROM USERS WHERE email = ?', [user.email]);
      if (!exists) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const result = await db.run(
          'INSERT INTO USERS (email, password_hash, role) VALUES (?, ?, ?)',
          [user.email, hashedPassword, user.role]
        );
        if (user.role === 'STUDENT') {
          await db.run('INSERT INTO USER_GLOBAL_STATS (user_id, lives, current_streak, total_problems_solved, correct_answers) VALUES (?, 3, 0, 0, 0)', [result.lastID]);
        }
        console.log(`Inserted default user: ${user.email}`);
      }
    } catch (err) {
      console.error(`Error inserting user ${user.email}:`, err);
    }
  }

  console.log('Seeding topics...');
  for (const topic of topics) {
    try {
      const exists = await db.get('SELECT topic_id FROM TOPICS WHERE name = ?', [topic]);
      if (!exists) {
        await db.run('INSERT INTO TOPICS (name) VALUES (?)', [topic]);
        console.log(`Inserted topic: ${topic}`);
      }
    } catch (err) {
      console.error(`Error inserting topic ${topic}:`, err);
    }
  }

  console.log('Seeding sample tasks for all topics and difficulties...');
  for (const topic of topics) {
      const tasksToInsert = generateSampleTasks(topic);
      for (const task of tasksToInsert) {
        try {
           const topicRow = await db.get('SELECT topic_id FROM TOPICS WHERE name = ?', [task.topicName]);
           if (topicRow) {
               const topicId = topicRow.topic_id;
               await db.run(
                   'INSERT INTO TASKS (topic_id, difficulty, task_type, task_text, correct_answer) VALUES (?, ?, ?, ?, ?)',
                   [topicId, task.difficulty, task.taskType, task.taskText, task.correctAnswer]
               );
           }
        } catch(err) {
            console.error(`Error inserting task: ${task.taskText}`, err);
        }
      }
  }

  console.log('Seeding complete.');
}

seed();