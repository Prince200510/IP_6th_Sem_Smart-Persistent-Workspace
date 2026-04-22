# 🚀 IP-B20 — Smart Persistent Workspace

A full-stack MERN application demonstrating **Object-Oriented Programming concepts in JavaScript** through a cloud-synced note-taking workspace with real-time auto-save, crash recovery, version history, and intelligent search.

> **6th Semester — Internet Programming Project**

[![Frontend](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](http://ip-oops-js.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render)](https://ip-oops-js-backend.onrender.com)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)

---

## 🌐 Live Demo

| Layer | URL |
|-------|-----|
| **Frontend** | [http://ip-oops-js.vercel.app](http://ip-oops-js.vercel.app) |
| **Backend API** | [https://ip-oops-js-backend.onrender.com](https://ip-oops-js-backend.onrender.com) |

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure login & registration with bcrypt password hashing
- 📝 **Note CRUD** — Create, read, update, and delete notes with real-time sync
- 📂 **Categories** — Organize notes into General, Work, Personal, Ideas, and Todo
- 📌 **Pin Notes** — Pin important notes to the top
- 🗄️ **Archive System** — Soft-delete with archive/restore and permanent delete
- 🔍 **Smart Search** — 400ms debounced search with weighted ranking algorithm
- 💡 **Recommendations** — Top 5 frequently used notes shown in sidebar
- 📊 **Usage Tracking** — Click-based usage counter per note
- 💾 **Auto-Save** — Automatic state persistence every 5 seconds (localStorage + MongoDB)
- 🕐 **Version History** — Up to 50 versioned snapshots with one-click restore
- 🔄 **Crash Recovery** — Detects unclean exits and offers session restoration
- 🧠 **State Persistence** — Full UI state preserved (notes, view, scroll position, composer)

---

## 🏗️ Architecture

```
┌──────────────────┐       REST API        ┌──────────────────┐       Mongoose       ┌──────────────────┐
│                  │  ─────────────────►    │                  │  ─────────────────►   │                  │
│   React 19       │                        │   Express.js     │                       │  MongoDB Atlas   │
│   Vite 8         │  ◄─────────────────    │   Node.js        │  ◄─────────────────   │                  │
│   TailwindCSS    │       JSON             │   JWT + bcrypt   │       Documents       │  3 Collections   │
│                  │                        │                  │                       │                  │
└──────────────────┘                        └──────────────────┘                       └──────────────────┘
     Vercel                                      Render                                  MongoDB Atlas
```

---

## 📁 Project Structure

```
IP_6th_Sem_Project/
│
├── client/                              # Frontend (React + Vite)
│   ├── index.html                       # HTML entry point
│   ├── package.json                     # Client dependencies
│   ├── vite.config.js                   # Vite configuration
│   ├── tailwind.config.js               # Tailwind theme & animations
│   ├── postcss.config.js                # PostCSS plugins
│   └── src/
│       ├── main.jsx                     # React root render
│       ├── App.jsx                      # Main app (Auth + Dashboard + Notes UI)
│       ├── AppStateContext.jsx           # Global state provider (React Context)
│       ├── CrashRecoveryModal.jsx        # Crash detection & session restore modal
│       ├── VersionHistoryPanel.jsx       # Slide-in version history panel
│       ├── App.css                       # Tailwind directives + custom styles
│       └── index.css                     # CSS variables + global styles
│
└── server/                              # Backend (Node.js + Express)
    ├── package.json                     # Server dependencies
    ├── server.js                        # Express server, routes & middleware
    ├── classes/
    │   ├── StateManager.js              # OOP: State persistence & versioning
    │   └── RecommendationEngine.js      # OOP: Search ranking & recommendations
    └── models/
        ├── User.js                      # Mongoose schema: User profile
        ├── Note.js                      # Mongoose schema: Notes
        └── StateSnapshot.js             # Mongoose schema: Versioned snapshots
```

---

## 🧬 OOP Concepts Demonstrated

This project showcases core **Object-Oriented Programming** principles using JavaScript ES6 classes:

| Concept | Implementation | File |
|---------|---------------|------|
| **Classes** | `StateManager` and `RecommendationEngine` defined using ES6 `class` syntax | `classes/` |
| **Encapsulation** | Model reference stored as `this.Note`, internal logic hidden from routes | Both classes |
| **Abstraction** | Complex CRUD sync (create/update/delete diff) exposed as a single `saveState()` method | `StateManager.js` |
| **Dependency Injection** | `new StateManager(NoteModel)` — model injected via constructor, not hardcoded | `server.js` |
| **Single Responsibility** | `StateManager` handles persistence; `RecommendationEngine` handles search | Separate classes |
| **Constructor Pattern** | Both classes initialize with required dependencies through constructors | Both classes |

### StateManager Class

```javascript
class StateManager {
  constructor(NoteModel)                           // Dependency injection
  saveState(userId, notes)                         // Sync notes (create/update/delete)
  loadState(userId)                                // Load all user notes
  saveSnapshot(userId, state, sessionId, label)    // Save versioned snapshot
  getVersionHistory(userId, limit)                 // List version history
  restoreVersion(userId, version)                  // Restore specific version
  checkCrash(userId, currentSessionId)             // Detect unclean sessions
  markCleanExit(userId, sessionId)                 // Mark session as cleanly exited
}
```

### RecommendationEngine Class

```javascript
class RecommendationEngine {
  constructor(NoteModel)                           // Dependency injection
  rankAndSearch(userId, query)                     // Weighted search (title: +15, content: +5)
  recommend(userId)                                // Top 5 by usage count
}
```

---

## 🔌 API Endpoints

### Authentication (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Create a new account |
| `POST` | `/auth/login` | Login and receive JWT token |

### State Management (Protected — JWT Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/state/save` | Save/sync notes to database |
| `GET`  | `/state/load` | Load all user notes |
| `POST` | `/state/snapshot` | Save a versioned state snapshot |
| `GET`  | `/state/versions` | Get version history |
| `POST` | `/state/restore` | Restore from a specific version |
| `GET`  | `/state/crash-check/:sessionId` | Check for crashed sessions |
| `POST` | `/state/clean-exit` | Mark session as cleanly exited |

### Notes Intelligence (Protected — JWT Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/notes/search?q=` | Search notes with weighted ranking |
| `GET` | `/notes/recommend` | Get top 5 recommended notes |

---

## 🗄️ Database Schema

### Users Collection

| Field | Type | Constraints |
|-------|------|-------------|
| `name` | String | required, trimmed |
| `email` | String | required, unique, lowercase |
| `username` | String | required, unique, trimmed |
| `password` | String | required (bcrypt hashed) |
| `phone` | String | optional |
| `city` | String | optional |
| `country` | String | optional |

### Notes Collection

| Field | Type | Default |
|-------|------|---------|
| `userId` | ObjectId (ref: User) | required |
| `title` | String | required |
| `content` | String | required |
| `usageCount` | Number | 0 |
| `isPinned` | Boolean | false |
| `category` | String | "General" |
| `isArchived` | Boolean | false |
| `timestamps` | Date | auto-generated |

### StateSnapshots Collection

| Field | Type | Default |
|-------|------|---------|
| `userId` | ObjectId (ref: User) | required |
| `snapshot` | Mixed (JSON) | required |
| `version` | Number | required |
| `label` | String | "Auto-save" |
| `sessionId` | String | required |
| `isCleanExit` | Boolean | false |
| `timestamps` | Date | auto-generated |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (v9 or higher)
- [MongoDB Atlas](https://www.mongodb.com/atlas) account (or local MongoDB)

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/Prince200510/neo-future-hckathon-v2.git
cd neo-future-hckathon-v2
```

**2. Setup Backend**

```bash
cd server
npm install
node server.js
```

The server will start on `http://localhost:5000`

**3. Setup Frontend**

```bash
cd client
npm install
npm run dev
```

The app will start on `http://localhost:5173`

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.2.4 | UI library |
| Vite | 8.0.4 | Build tool & dev server |
| TailwindCSS | 3.4.19 | Utility-first CSS framework |
| Lucide React | 1.8.0 | Icon library |
| Inter | Google Fonts | Typography |

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Express.js | 4.18.2 | HTTP server framework |
| Mongoose | 7.5.0 | MongoDB ODM |
| bcryptjs | 2.4.3 | Password hashing |
| jsonwebtoken | 9.0.2 | JWT authentication |
| cors | 2.8.5 | Cross-origin requests |

### Deployment

| Service | Purpose |
|---------|---------|
| **Vercel** | Frontend hosting |
| **Render** | Backend hosting |
| **MongoDB Atlas** | Cloud database |

---

## 🔄 Auto-Save & Crash Recovery Flow

```
User opens app
    │
    ├── Check for crashed sessions (unclean exits)
    │     ├── Found → Show recovery modal → Restore or Discard
    │     └── Not found → Continue
    │
    ├── Load notes from backend (GET /state/load)
    │
    ├── Every 5 seconds:
    │     ├── Capture full UI state (notes, view, scroll, composer)
    │     ├── Save to localStorage
    │     └── Save snapshot to MongoDB (POST /state/snapshot)
    │
    └── On page close:
          ├── Save state to localStorage
          └── Send clean-exit beacon (POST /state/clean-exit)
```

---

## 📊 Project Statistics

| Metric | Count |
|--------|-------|
| Source Files | 13 |
| Frontend Components | 7 |
| Backend Classes (OOP) | 2 |
| Database Models | 3 |
| API Endpoints | 11 |
| State Variables | 20+ |
| Total Lines of Code | ~1,450 |

---

## 📄 License

This project is developed for educational purposes as part of the 6th Semester Internet Programming coursework.

---

<p align="center">
  Built with ❤️ using the MERN Stack
</p>
