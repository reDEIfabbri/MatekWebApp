# AI Agents Guide for MatekWebApp

This document provides guidelines for AI agents working on the `MatekWebApp` project.

## Project Overview
MatekWebApp is a React-based web application with a Node.js backend using SQLite for data storage. It is designed to be a platform for interacting with mathematical equations, utilizing `mathlive` for math editing and Radix UI for components. It is built with Vite.

## Tech Stack
*   **Frontend:** React, Vite, Tailwind CSS, Radix UI, mathlive.
*   **Backend:** Node.js, Express (assumed based on `routes.js`).
*   **Database:** SQLite (`matekwebapp.db`).

## Project Structure
*   `/src`: Contains the React frontend code.
    *   `/src/components`: UI components.
    *   `/src/pages`: Application pages (e.g., Login, Registration, Dashboard).
    *   `/src/lib`: Utility functions.
*   `/server`: Contains the Node.js backend code.
    *   `/server/index.js`: Main server entry point.
    *   `/server/routes.js`: API route definitions.
    *   `/server/database.js`: Database configuration and connection.
    *   `/server/seed.js`: Database seeding script.
*   `next_steps.md`: Contains the roadmap and current priorities.
*   `SCHEDULE.md`: Project schedule and milestones.

## AI Agent Guidelines

1.  **Code Style & Consistency:**
    *   Always analyze existing code before making modifications to ensure consistency in styling, naming conventions, and architectural patterns.
    *   Use modern JavaScript/React features (ES6+, Functional Components, Hooks).
    *   For the frontend, follow Tailwind CSS utility class patterns.

2.  **Tools & API Usage:**
    *   Prioritize specialized IDE tools (e.g., `write_file`, `resolve_symbol`) over generic shell commands.
    *   **NEVER** use shell commands like `sed`, `awk`, `perl`, or shell redirection (`>`, `>>`) to modify files. Always use the `write_file` tool to update entire file contents to prevent buffer desynchronization.

3.  **Task Execution Flow:**
    *   **Analyze:** Read relevant files (`next_steps.md`, `README.md`, etc.) to understand the context.
    *   **Search:** Use file search and symbol resolution tools to locate where changes need to be made.
    *   **Modify:** Use the `write_file` tool to implement changes.
    *   **Verify:** Check if the changes introduce any errors using the `analyze_current_file` tool if applicable.

4.  **Priorities:**
    *   Always refer to `next_steps.md` for current development priorities.
    *   Focus on completing the tasks outlined in the active phase (e.g., User Authentication, Core Math Feature).

5.  **Database:**
    *   When modifying the database schema in `/server/database.js`, ensure that you also consider updating or providing a script for migration or seeding in `/server/seed.js` if necessary.

6.  **Security:**
    *   When working on authentication, ensure passwords are hashed (e.g., using `bcrypt`) and session management is secure (e.g., using `jsonwebtoken`).
