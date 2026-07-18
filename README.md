# 🏛️ Bait El-Hakma (بيت الحكمة)

**House of Wisdom** - A comprehensive productivity web application designed to help you focus, organize, and achieve your goals.

![Bait El-Hakma](https://img.shields.io/badge/Bait%20El--Hakma-House%20of%20Wisdom-8b5cf6)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-06B6D4?logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite)

## ✨ Features

### 🎯 Pomodoro Timer
- Customizable focus time, short break, and long break intervals
- Circular progress indicator with smooth animations
- Sound notifications for start and finish
- Session history tracking
- Configurable auto-start options

### 🎥 Focus Video Player
- Play YouTube videos or local files
- Syncs with Pomodoro timer (play/pause together)
- Picture-in-Picture mode support
- Floating mini-player window
- Curated focus music suggestions

### 📋 Kanban Planner
- GTD/PARA style task management
- Drag and drop cards between columns
- Color-coded labels and priority flags
- Mindspace section for long-term planning
- Customizable columns

### 📚 Book Library
- Personal book collection tracker
- Reading progress monitoring
- Notes and highlights for each book
- Tag-based filtering and search
- Book cover support

### ✅ Daily Todo List
- Simple daily task management
- Priority levels (low, medium, high)
- Dual calendar display (Gregorian & Hijri)
- Progress tracking

### 📊 Activity Statistics
- Visual charts and analytics
- Pomodoro session history
- Task completion rates
- Reading progress
- Achievement badges

### 🌟 Motivation Section
- Random Hadith collection
- Quranic verses
- Motivational quotes
- Favorites system
- Share and copy functionality

### 🏆 Challenge Tracker
- Create custom challenges (e.g., 100DaysOfCode)
- Visual day grid with progress tracking
- Streak calculation
- Multiple challenge support

## 🎨 Themes

Bait El-Hakma includes 5 beautiful themes:

- **Light** - Clean and bright default theme
- **Dark** - Easy on the eyes for night sessions
- **Dracula** - Popular developer theme with vibrant colors
- **Monokai** - Classic code editor theme
- **GitHub** - Familiar GitHub-inspired colors

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/bait-el-hakma.git
cd bait-el-hakma
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 📁 Project Structure

```
bait-el-hakma/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── TabNavigation.tsx
│   ├── context/            # React context providers
│   │   ├── ThemeContext.tsx
│   │   └── AppContext.tsx
│   ├── sections/           # Main feature sections
│   │   ├── PomodoroTimer.tsx
│   │   ├── VideoPlayer.tsx
│   │   ├── KanbanBoard.tsx
│   │   ├── BookLibrary.tsx
│   │   ├── DailyTodo.tsx
│   │   ├── ActivityStats.tsx
│   │   ├── Motivation.tsx
│   │   └── ChallengeTracker.tsx
│   ├── types/              # TypeScript type definitions
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/                 # Static assets
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 🌐 Deployment

### Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

### Netlify

1. Build the project:
```bash
npm run build
```

2. Drag and drop the `dist` folder to Netlify, or use Netlify CLI:
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

### GitHub Pages

1. Install gh-pages:
```bash
npm i -D gh-pages
```

2. Add to `package.json`:
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. Deploy:
```bash
npm run deploy
```

### Firebase Hosting

1. Install Firebase CLI:
```bash
npm i -g firebase-tools
```

2. Login and initialize:
```bash
firebase login
firebase init hosting
```

3. Deploy:
```bash
firebase deploy
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Firebase Configuration (optional)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Customizing Themes

Themes are defined in `src/index.css`. You can modify the CSS variables to create your own theme:

```css
.theme-your-theme {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... other variables */
}
```

## 🛠️ Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Context + useReducer
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Created by**: Rajaei Muhammed
- **Built with**: KIMI AI
- **Support**: [Buy me a coffee](https://ko-fi.com/rajaeimuhammed)

## 📱 Screenshots

*Screenshots will be added soon*

## 🔮 Roadmap

- [ ] Firebase Authentication integration
- [ ] Cloud sync for data persistence
- [ ] Mobile app (React Native)
- [ ] Browser extension
- [ ] Team collaboration features
- [ ] API for third-party integrations
- [ ] Dark mode improvements
- [ ] More theme options
- [ ] Advanced statistics
- [ ] Export data functionality

## 💬 Support

If you found this project helpful, consider supporting the developer:

[![Ko-fi](https://img.shields.io/badge/Ko--fi-Support%20Me-FF5E5B?logo=ko-fi)](https://ko-fi.com/rajaeimuhammed)

## 📧 Contact

- **Developer**: Rajaei Muhammed
- **Project**: Bait El-Hakma (House of Wisdom)
- **Support Link**: https://ko-fi.com/rajaeimuhammed

---

<p align="center">
  <strong>بيت الحكمة</strong> - House of Wisdom
</p>
<p align="center">
  Made with ❤️ and ☕ by Rajaei Muhammed
</p>
