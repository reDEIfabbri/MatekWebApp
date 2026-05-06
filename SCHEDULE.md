# Project Schedule

- [x] 2025-10-31: Market Research & User Survey (Milestone 0)
- [x] 2025-12-01: Detailed Planning & Data Model (Milestone 1)
- [ ] 2026-01-31: Technology Foundation (Phase 2)
- [ ] 2026-03-31: Core Functionality & Architecture (Milestone 2)
- [ ] 2026-04-30: Content Implementation & Code Freeze (Milestone 3)
- [ ] 2026-05-15: Testing & Documentation (Milestone 4)

## Core Functionality Checklist

### User Management & Authentication
- [ ] User Registration (Student/Admin)
- [ ] User Login
- [ ] JWT-based session management
- [ ] Role-based access control (Student vs. Admin)

### Task & Practice
- [ ] Task Engine for serving questions
- [ ] Adaptive algorithm for task difficulty (MVP: random)
- [ ] Render mathematical formulas (KaTeX)
- [ ] Submit and evaluate answers
- [ ] Display correct answer after submission

### Gamification & Statistics
- [ ] Track user proficiency per topic (`USER_TOPIC_STATS`)
- [ ] Track global user stats (lives, streak) (`USER_GLOBAL_STATS`)
- [ ] User Dashboard to display stats
- [ ] "Echelon" system for ranking/levels
- [ ] "Lives-Streak-Reward" system

### Admin & Content Management
- [ ] Admin panel to manage content
- [ ] CRUD operations for Tasks (Create, Read, Update, Delete)
- [ ] CRUD operations for Topics
- [ ] Interface to create tasks from templates
- [ ] **Math Keyboard / Editor** (MathLive) for easier content creation

### General UI/UX
- [ ] Responsive design (Mobile-First)
- [ ] Consistent UI using shadcn/ui components
- [ ] Clear navigation between Login, Dashboard, Task Screen, and Admin Panel

---

## [x] Market Research & User Survey (Milestone 0)
Competitor analysis (min. 3 platforms), User Persona drafts (Student, Admin), Final top 5 Must-Have feature list. Determining task types and templates.

## Detailed Planning & Data Model (Milestone 1)
Full Technical Specification, Complete SQLite Relational Data Model (tables and schemas), Detailed Design of Task Templates, UI/UX Mockups.

## Technology Foundation (start Phase 2)
Learning React, Node.js/Express, and SQLite. Setting up the architecture and configuring JWT Authentication. Developing smaller prototype apps to test server communication.

## Core Functionality & Architecture (Milestone 2)
Working Architecture (React/Node.js/SQLite connection), Core JWT-based Authentication and Permission system, Basic logic of the Task Engine, Admin interface for content uploading (minimalist MVP).

## Content Implementation & Code Freeze (Milestone 3)
Full Content Implementation: All 28 topics have at least 5 tasks each. Complete Gamification logic (Lives/Streak/Rewards) is working. UI/UX refinement. Functionality freeze.

## Testing & Documentation (Milestone 4)
Internal/External Beta Testing logs, fixing all critical bugs, finalizing thesis-specific technical documentation and presentation materials.
