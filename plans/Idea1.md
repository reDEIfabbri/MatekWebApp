# MatekWebApp Setup Guide

This guide outlines the steps to initialize the **MatekWebApp** project with React, Tailwind CSS v4, shadcn/ui, and a Node.js/SQLite backend.

**Note:** The project is already version-controlled with Git (https://github.com/reDEIfabbri/MatekWebApp.git). Ensure you are in the project root directory before proceeding.

## Prerequisites

Ensure you have Node.js (version 18.17 or later) installed on your local machine.

## Part 1: Frontend Setup

### Step 1: Initialize React Project with Vite

Since the directory already exists, we will initialize the Vite project in the current directory.

Open your terminal in the project root (`/home/sumisu/Documents/MatekWebApp`) and run:

```bash
npm create vite@latest . -- --template react
```

*Note: The `.` specifies the current directory.*

**Important:** If Vite installs React 19 by default, you might encounter dependency conflicts with `lucide-react` or other libraries. It is recommended to downgrade to React 18 in `package.json` if you see `ERESOLVE` errors.

### Step 2: Install Tailwind CSS v4

Install Tailwind CSS and the Vite plugin. We also add common shadcn/ui dependencies to avoid future issues.

```bash
npm install tailwindcss @tailwindcss/vite class-variance-authority clsx lucide-react tailwind-merge tailwindcss-animate
```

### Step 3: Configure Vite

Add the `@tailwindcss/vite` plugin to your Vite configuration and configure the path alias.

Edit `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Step 4: Import Tailwind CSS

Add the Tailwind CSS import to your main CSS file (usually `src/index.css`). You can remove any existing content in this file.

```css
@import "tailwindcss";
```

### Step 5: Configure Import Alias (jsconfig.json)

shadcn/ui requires an import alias to be configured. Create `jsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "./src/*"
      ]
    }
  }
}
```

### Step 6: Install and Initialize shadcn/ui

Run the shadcn/ui init command.

```bash
npx shadcn@latest init
```

You will be asked a few questions to configure `components.json`:

```txt
Which style would you like to use? › Default
Which color would you like to use as base color? › Slate
Would you like to use CSS variables for colors? › yes
```

### Step 7: Add Components

You can now add components to your project. For example, to add a button:

```bash
npx shadcn@latest add button
```

The component code will be placed in `src/components/ui/button.jsx` (or `.tsx`).

### Step 8: Start the Development Server

Finally, start your development server to see your app in action:

```bash
npm run dev
```

You can now import and use the components in your application!

```jsx
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div>
      <Button>Click me</Button>
    </div>
  )
}
```

### Step 9: Using shadcn/ui Blocks

shadcn/ui Blocks are pre-built sections (like dashboards, authentication forms, hero sections) that you can copy and paste into your project.

1.  **Browse Blocks:** Visit the [shadcn/ui Blocks](https://ui.shadcn.com/blocks) page.
2.  **Select a Block:** Choose a block you like (e.g., "Dashboard 01").
3.  **Install Dependencies:** The block description will list the components it uses (e.g., `Card`, `Button`, `Input`, `DropdownMenu`). Install them using the CLI:
    ```bash
    npx shadcn@latest add card button input dropdown-menu
    ```
4.  **Copy Code:** Click "Copy Code" on the block page.
5.  **Create Component:** Create a new file in your project (e.g., `src/components/Dashboard.jsx`) and paste the code.
6.  **Use it:** Import and use the new component in your `App.jsx` or page.

---

## Part 2: Backend & Database Setup

This section covers setting up the Node.js/Express backend and the SQLite database as per the Technical Specification.

### Step 10: Create Server Directory and Install Dependencies

We will create a `server` directory to keep the backend logic separate.

1.  **Create directory:**
    ```bash
    mkdir server
    ```

2.  **Install Backend Dependencies:**
    Run this in the project root. We are adding these to the main `package.json` for simplicity, but they will be used by the server code.
    ```bash
    npm install express sqlite3 sqlite cors dotenv bcrypt jsonwebtoken
    npm install -D nodemon concurrently
    ```

### Step 11: Initialize Database (SQLite)

Create a file named `server/database.js`. This script will connect to the SQLite database and initialize the tables if they don't exist.

**`server/database.js`**

```javascript
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
      task_text TEXT,
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

export { dbPromise, initializeDatabase };
```

### Step 12: Create API Routes

Create a file named `server/routes.js` to handle API requests.

**`server/routes.js`**

```javascript
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
    res.json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

### Step 13: Create the Express Server

Create a file named `server/index.js`.

**`server/index.js`**

```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './database.js';
import apiRoutes from './routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Database
initializeDatabase().catch(err => {
  console.error('Failed to initialize database:', err);
});

// API Routes
app.use('/api', apiRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.send('MatekWebApp API is running');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

### Step 14: Update package.json Scripts

Update your `package.json` to include scripts for running the server and the frontend concurrently.

```json
{
  "scripts": {
    "dev": "concurrently \"vite\" \"nodemon server/index.js\"",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "server": "nodemon server/index.js",
    "start": "node server/index.js"
  }
}
```

### Step 15: Run the App

To run both frontend and backend concurrently:

```bash
npm run dev
```

---

### Final Project Structure

```
MatekWebApp/
├── .git/
├── node_modules/
├── public/
├── server/
│   ├── database.js
│   ├── index.js
│   └── routes.js
├── src/
│   ├── components/
│   │   └── ui/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── jsconfig.json
├── matekwebapp.db (generated after running server)
├── package.json
└── vite.config.js
```
