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
      await db.run('INSERT INTO USER_GLOBAL_STATS (user_id, lives, current_streak, total_problems_solved, correct_answers) VALUES (?, 3, 0, 0, 0)', [result.lastID]);
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
    const { topicId } = req.query;
    if (!topicId) return res.status(400).json({ error: 'topicId is required' });

    try {
        const db = await dbPromise;
        const userId = req.user.userId;

        // Get all distinct difficulties for the topic, sorted
        const difficulties = await db.all(
            'SELECT DISTINCT difficulty FROM TASKS WHERE topic_id = ? ORDER BY difficulty ASC',
            [topicId]
        );

        let unlockedDifficulty = difficulties.length > 0 ? difficulties[0].difficulty : null;

        for (let i = 0; i < difficulties.length - 1; i++) {
            const currentDiff = difficulties[i].difficulty;
            const nextDiff = difficulties[i + 1].difficulty;

            const stats = await db.get(
                'SELECT attempts, correct_answers FROM USER_DIFFICULTY_STATS WHERE user_id = ? AND topic_id = ? AND difficulty = ?',
                [userId, topicId, currentDiff]
            );

            if (stats && stats.attempts > 0) {
                const successRate = stats.correct_answers / stats.attempts;
                if (successRate >= 0.85) {
                    unlockedDifficulty = nextDiff; // Unlock the next level
                } else {
                    break; // Stop if the current level isn't passed
                }
            } else {
                break; // Stop if no attempts have been made on the current level
            }
        }
        
        // If the very first level has no stats, it should still be unlocked
        if (unlockedDifficulty === null && difficulties.length > 0) {
            unlockedDifficulty = difficulties[0].difficulty;
        }

        if (unlockedDifficulty === null) {
            return res.json([]); // No problems available or no difficulties defined
        }

        // Fetch problems for the highest unlocked difficulty
        const problems = await db.all(
            'SELECT task_id, topic_id, difficulty, task_type, task_text, choices FROM TASKS WHERE topic_id = ? AND difficulty = ?',
            [topicId, unlockedDifficulty]
        );

        res.json(problems);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/problems/submit', authenticateToken, async (req, res) => {
    if (req.user.role !== 'STUDENT') return res.sendStatus(403);
    const { taskId, answer } = req.body;
    const userId = req.user.userId;

    try {
        const db = await dbPromise;
        const task = await db.get('SELECT topic_id, difficulty, correct_answer FROM TASKS WHERE task_id = ?', [taskId]);
        if (!task) return res.status(404).json({ error: 'Task not found' });
        
        const isCorrect = task.correct_answer.trim().toLowerCase() === answer.trim().toLowerCase();

        // Update global stats (streak/lives/total/correct)
        if (isCorrect) {
          await db.run('UPDATE USER_GLOBAL_STATS SET current_streak = current_streak + 1, total_problems_solved = total_problems_solved + 1, correct_answers = correct_answers + 1 WHERE user_id = ?', [userId]);
        } else {
          await db.run('UPDATE USER_GLOBAL_STATS SET current_streak = 0, lives = MAX(0, lives - 1), total_problems_solved = total_problems_solved + 1 WHERE user_id = ?', [userId]);
        }

        // Update difficulty-specific stats
        const { topic_id, difficulty } = task;
        const stat = await db.get(
            'SELECT stat_id FROM USER_DIFFICULTY_STATS WHERE user_id = ? AND topic_id = ? AND difficulty = ?',
            [userId, topic_id, difficulty]
        );

        if (stat) {
            const correctIncrement = isCorrect ? 1 : 0;
            await db.run(
                'UPDATE USER_DIFFICULTY_STATS SET attempts = attempts + 1, correct_answers = correct_answers + ? WHERE stat_id = ?',
                [correctIncrement, stat.stat_id]
            );
        } else {
            const correctAnswers = isCorrect ? 1 : 0;
            await db.run(
                'INSERT INTO USER_DIFFICULTY_STATS (user_id, topic_id, difficulty, attempts, correct_answers) VALUES (?, ?, ?, 1, ?)',
                [userId, topic_id, difficulty, correctAnswers]
            );
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
      const stats = await db.get('SELECT lives, current_streak, total_problems_solved, correct_answers FROM USER_GLOBAL_STATS WHERE user_id = ?', [req.params.userId]);
      
      if (!stats) return res.status(404).json({ error: 'Progress not found' });
      
      res.json(stats);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// Admin Statistics Routes
router.get('/admin/stats/global', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.sendStatus(403);
    try {
        const db = await dbPromise;
        const totalUsers = await db.get('SELECT COUNT(*) as count FROM USERS WHERE role = "STUDENT"');
        const totalTasks = await db.get('SELECT COUNT(*) as count FROM TASKS');
        const overallStats = await db.get(`
            SELECT 
                SUM(total_problems_solved) as total_solved, 
                SUM(correct_answers) as total_correct 
            FROM USER_GLOBAL_STATS
        `);

        res.json({
            total_users: totalUsers.count,
            total_tasks: totalTasks.count,
            total_problems_solved: overallStats.total_solved || 0,
            overall_accuracy: (overallStats.total_correct / overallStats.total_solved) || 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/admin/stats/task-specific', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN') return res.sendStatus(403);
    try {
        const db = await dbPromise;
        const taskStats = await db.all(`
            SELECT 
                t.task_id,
                t.task_text,
                tp.name as topic_name,
                SUM(uds.attempts) as total_attempts,
                SUM(uds.correct_answers) as total_correct
            FROM TASKS t
            JOIN TOPICS tp ON t.topic_id = tp.topic_id
            LEFT JOIN USER_DIFFICULTY_STATS uds ON t.topic_id = uds.topic_id AND t.difficulty = uds.difficulty
            GROUP BY t.task_id
            ORDER BY total_attempts DESC
            LIMIT 20
        `);
        res.json(taskStats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;