import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { dbPromise } from './database.js';

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || 'your_super_secret_key';

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Auth Routes
router.post('/auth/register', async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const db = await dbPromise;
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role === 'ADMIN' ? 'ADMIN' : 'STUDENT';
    const result = await db.run(
        'INSERT INTO USERS (email, password_hash, role) VALUES (?, ?, ?)',
        [email, hashedPassword, userRole]
    );
    if (userRole === 'STUDENT') {
      await db.run('INSERT INTO USER_GLOBAL_STATS (user_id, lives, current_streak) VALUES (?, 3, 0)', [result.lastID]);
    }
    res.status(201).json({ message: 'User created', userId: result.lastID });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const db = await dbPromise;
    const user = await db.get('SELECT * FROM USERS WHERE email = ?', [email]);
    if (!user) return res.status(400).json({ error: 'User not found' });
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });
    const token = jwt.sign({ userId: user.user_id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token, role: user.role, userId: user.user_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Topic Routes
router.get('/topics', authenticateToken, async (req, res) => {
  try {
    const db = await dbPromise;
    const topics = await db.all('SELECT * FROM TOPICS');
    res.json(topics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/topics', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.sendStatus(403);
    const { name } = req.body;
    try {
        const db = await dbPromise;
        const result = await db.run('INSERT INTO TOPICS (name) VALUES (?)', [name]);
        res.status(201).json({ message: 'Topic created', topicId: result.lastID });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin Task Routes
router.post('/admin/tasks', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.sendStatus(403);
  const { topicId, difficulty, taskType = 'TEXT_ANSWER', taskText, correctAnswer } = req.body;
  try {
    const db = await dbPromise;
    const result = await db.run(
        'INSERT INTO TASKS (topic_id, difficulty, task_type, task_text, correct_answer) VALUES (?, ?, ?, ?, ?)',
        [topicId, difficulty, taskType, taskText, correctAnswer]
    );
    res.status(201).json({ message: 'Task created', taskId: result.lastID });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Problems Routes
router.get('/problems', authenticateToken, async (req, res) => {
    if (req.user.role !== 'STUDENT') return res.sendStatus(403);
    try {
        const db = await dbPromise;
        const { topicId } = req.query;
        let problems;
        if (topicId) {
          problems = await db.all('SELECT task_id, topic_id, difficulty, task_type, task_text, choices FROM TASKS WHERE topic_id = ?', [topicId]);
        } else {
          problems = await db.all('SELECT task_id, topic_id, difficulty, task_type, task_text, choices FROM TASKS');
        }
        res.json(problems);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/problems/submit', authenticateToken, async (req, res) => {
    if (req.user.role !== 'STUDENT') return res.sendStatus(403);
    const { taskId, answer } = req.body;
    try {
        const db = await dbPromise;
        const task = await db.get('SELECT correct_answer FROM TASKS WHERE task_id = ?', [taskId]);
        if (!task) return res.status(404).json({ error: 'Task not found' });
        
        const isCorrect = task.correct_answer.trim() === answer.trim();

        if (isCorrect) {
          await db.run('UPDATE USER_GLOBAL_STATS SET current_streak = current_streak + 1 WHERE user_id = ?', [req.user.userId]);
        } else {
          await db.run('UPDATE USER_GLOBAL_STATS SET current_streak = 0, lives = MAX(0, lives - 1) WHERE user_id = ?', [req.user.userId]);
        }
        
        res.json({ correct: isCorrect });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// User Progress Route
router.get('/users/:userId/progress', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN' && req.user.userId !== parseInt(req.params.userId)) {
      return res.sendStatus(403);
  }

  try {
      const db = await dbPromise;
      const stats = await db.get('SELECT lives, current_streak FROM USER_GLOBAL_STATS WHERE user_id = ?', [req.params.userId]);
      
      if (!stats) return res.status(404).json({ error: 'Progress not found' });
      
      res.json(stats);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});


export default router;