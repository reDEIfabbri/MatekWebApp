# MatekWebApp Setup Guide

This guide outlines the steps to initialize the **MatekWebApp** project with React, Tailwind CSS v4, and shadcn/ui.

**Note:** The project is already version-controlled with Git (https://github.com/reDEIfabbri/MatekWebApp.git). Ensure
you are in the project root directory before proceeding.

## Prerequisites

Ensure you have Node.js (version 18.17 or later) installed on your local machine.

## Step 1: Initialize React Project with Vite

Since the directory already exists, we will initialize the Vite project in the current directory.

Open your terminal in the project root (`/home/sumisu/Documents/MatekWebApp`) and run:

```bash
npm create vite@latest . -- --template react
```

*Note: The `.` specifies the current directory.*

## Step 2: Install Tailwind CSS v4

Install Tailwind CSS and the Vite plugin:

```bash
npm install tailwindcss @tailwindcss/vite
```

## Step 3: Configure Vite

Add the `@tailwindcss/vite` plugin to your Vite configuration and configure the path alias.

Edit `vite.config.js`:

```javascript
import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

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

*Note: If you are using ES modules in `vite.config.js` (default in newer Vite), you might need to
use `import.meta.dirname` instead of `__dirname` or construct it manually.*

## Step 4: Import Tailwind CSS

Add the Tailwind CSS import to your main CSS file (usually `src/index.css`). You can remove any existing content in this
file.

```css
@import "tailwindcss";
```

## Step 5: Configure Import Alias (jsconfig.json or tsconfig.json)

shadcn/ui requires an import alias to be configured in your project's `jsconfig.json` (for JavaScript) or
`tsconfig.json` (for TypeScript).

**For JavaScript projects (create `jsconfig.json`):**

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

**For TypeScript projects (edit `tsconfig.json`):**

```json
{
  "compilerOptions": {
    // ...
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "./src/*"
      ]
    }
    // ...
  }
}
```

## Step 6: Install and Initialize shadcn/ui

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

## Step 7: Add Components

You can now add components to your project. For example, to add a button:

```bash
npx shadcn@latest add button
```

The component code will be placed in `src/components/ui/button.jsx` (or `.tsx`).

## Step 8: Start the Development Server

Finally, start your development server to see your app in action:

```bash
npm run dev
```

You can now import and use the components in your application!

```jsx
import {Button} from "@/components/ui/button"

export default function Home() {
    return (
        <div>
            <Button>Click me</Button>
        </div>
    )
}
```

---

### Project Structure

Your project directory should look something like this after setup:

```
MatekWebApp/
├── .git/
├── node_modules/
├── public/
├── src/
│   ├── components/
│   │   └── ui/
│   │       └── button.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── jsconfig.json (or tsconfig.json)
├── package.json
└── vite.config.js
```
