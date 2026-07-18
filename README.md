<p align="center">
  <img src="public/logo.png" alt="Bait El-Hakma Logo" width="150" />
</p>

<h1 align="center">Bait El-Hakma</h1>
<h3 align="center">بيت الحكمة — House of Wisdom</h3>

<p align="center">
  A comprehensive productivity web application with cloud sync, authentication, and beautiful themes.
</p>

<p align="center">
  <a href="https://bait-el-hakma.vercel.app/">
    <img src="https://img.shields.io/badge/Live_Demo-Vercel-8b5cf6?style=for-the-badge&logo=vercel" alt="Live Demo" />
  </a>
  <a href="https://github.com/meuor/Bait-El-Hakma">
    <img src="https://img.shields.io/badge/Source_Code-GitHub-333?style=for-the-badge&logo=github" alt="GitHub" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&style=flat-square" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&style=flat-square" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&style=flat-square" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&style=flat-square" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Neon_DB-PostgreSQL-00E599?logo=postgresql&style=flat-square" alt="Neon" />
  <img src="https://img.shields.io/badge/Vercel-Deploy-000?logo=vercel&style=flat-square" alt="Vercel" />
</p>

---

## Live Demo

**[https://bait-el-hakma.vercel.app/](https://bait-el-hakma.vercel.app/)**

Create an account to sync your data across devices. Your data is securely stored in the cloud.

---

## Features

### Pomodoro Timer
- Customizable focus/break intervals
- Circular SVG progress ring
- Sound notifications
- Session history & daily stats

### Focus Video Player
- YouTube & local video support
- Picture-in-Picture mode
- Floating mini-player
- Curated focus music suggestions

### Kanban Board
- Drag & drop cards between columns
- Color-coded labels & priorities
- GTD/PARA style organization
- 4-column default layout

### Book Library
- Personal reading tracker
- Progress monitoring (0-100%)
- Notes with page numbers
- Tag-based filtering & search

### Daily Todo
- Priority levels (low/medium/high)
- Dual calendar (Gregorian & Hijri)
- Progress bar
- Active/Done filters

### Activity Statistics
- Interactive charts (Recharts)
- Pomodoro, task, and reading analytics
- Achievement badges
- Streak tracking

### Motivation
- Hadith collection
- Quranic verses with transliteration
- Motivational quotes
- Favorites & clipboard copy

### Challenge Tracker
- Custom day-based challenges
- Visual day grid
- Streak calculation
- Multiple challenge support

---

## Authentication & Cloud Sync

Bait El-Hakma features a complete authentication system:

- **Register / Login** with email & password
- **JWT-based** session management
- **Cloud database** (Neon PostgreSQL)
- **Access from any device** by signing in
- **Data migration** tool to import existing local data

---

## Themes

5 built-in themes with full dark mode support:

| Theme | Description |
|-------|-------------|
| Light | Clean & bright default |
| Dark | Easy on the eyes |
| Dracula | Vibrant developer theme |
| Monokai | Classic code editor |
| GitHub | GitHub-inspired colors |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript 5.9 |
| Build | Vite 7 |
| Styling | Tailwind CSS 3.4 + shadcn/ui |
| State | React Context + useReducer |
| Charts | Recharts |
| Animations | Framer Motion |
| Icons | Lucide React |
| Auth | JWT + bcryptjs |
| Database | Neon PostgreSQL (serverless) |
| Hosting | Vercel |

---

## Project Structure

```
Bait-El-Hakma/
├── api/                        # Vercel Serverless Functions
│   ├── _lib/                   # Shared utilities (db, auth)
│   ├── auth/                   # Authentication (register, login, profile, stats)
│   ├── kanban/                 # Kanban board CRUD
│   ├── books/                  # Book library CRUD + notes
│   ├── pomodoro/               # Pomodoro sessions CRUD
│   ├── todos/                  # Daily todos CRUD
│   ├── challenges/             # Challenges CRUD
│   ├── settings/               # User settings
│   └── migrate/                # Data migration endpoint
├── src/
│   ├── components/
│   │   ├── auth/               # LoginForm, RegisterForm, ProfilePage
│   │   ├── ui/                 # 73 shadcn/ui components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── TabNavigation.tsx
│   ├── context/
│   │   ├── AppContext.tsx      # Central state + API sync
│   │   └── ThemeContext.tsx    # Theme management
│   ├── sections/               # 8 feature sections
│   ├── lib/
│   │   ├── api.ts              # API client
│   │   └── utils.ts            # Utility functions
│   ├── types/index.ts          # TypeScript types
│   └── index.css               # Themes & global styles
├── public/
│   └── logo.png
├── vercel.json
├── package.json
└── vite.config.ts
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Neon PostgreSQL database
- Vercel account

### Local Development

```bash
# Clone the repo
git clone https://github.com/meuor/Bait-El-Hakma.git
cd Bait-El-Hakma

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

# Start dev server
npm run dev
```

### Environment Variables

| Variable | Description | Where to get |
|----------|-------------|--------------|
| `DATABASE_URL` | Neon PostgreSQL connection string | [Neon Console](https://console.neon.tech) |
| `JWT_SECRET` | Secret key for JWT tokens | Generate any secure string |

---

## Deployment

The project is deployed on **Vercel** with automatic GitHub integration.

Every push to `master` triggers a new deployment.

### Deploy your own:

1. Fork this repo
2. Create a Neon database and run `api/_lib/schema.sql`
3. Import the repo into Vercel
4. Add `DATABASE_URL` and `JWT_SECRET` as environment variables
5. Deploy!

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Author

**Rajaei Muhammed**

[![Ko-fi](https://img.shields.io/badge/Ko--fi-Buy_Me_a_Coffee-FF5E5B?logo=ko-fi&style=flat-square)](https://ko-fi.com/rajaeimuhammed)

---

<p align="center">
  <strong>بيت الحكمة</strong> — House of Wisdom
</p>
<p align="center">
  Made with ❤️ by Rajaei Muhammed
</p>
