import { useState } from 'react';
import {
  BookOpen,
  Timer,
  LayoutGrid,
  Library,
  CheckSquare,
  BarChart3,
  Brain,
  Cloud,
  Users,
  Sparkles,
  ArrowRight,
  ChevronRight,
  X,
  ZoomIn,
} from 'lucide-react';
import './LandingPage.css';

interface LandingPageProps {
  onLogin: () => void;
  onRegister: () => void;
}

const features = [
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: 'Full Quran Reader',
    desc: 'Read the entire Quran with book-style layout, multiple Mushaf themes, verse bookmarks, and daily reading tracker with progress sync.',
    accent: 'purple',
  },
  {
    icon: <Timer className="w-6 h-6" />,
    title: 'Pomodoro Timer',
    desc: 'Stay focused with customizable work/break intervals, session tracking, and a floating mini-player that persists across all tabs.',
    accent: 'blue',
  },
  {
    icon: <LayoutGrid className="w-6 h-6" />,
    title: 'Kanban Board',
    desc: 'Organize tasks visually with drag-and-drop columns. Perfect for project planning and workflow management.',
    accent: 'green',
  },
  {
    icon: <Library className="w-6 h-6" />,
    title: 'Book Library',
    desc: 'Track your reading journey with covers, progress, tags, and personal notes. Never lose track of what you are reading.',
    accent: 'orange',
  },
  {
    icon: <CheckSquare className="w-6 h-6" />,
    title: 'Daily Tasks',
    desc: 'Plan your day with todos, mark completions, and track your productivity streak over time.',
    accent: 'pink',
  },
  {
    icon: <Cloud className="w-6 h-6" />,
    title: 'Cloud Sync',
    desc: 'All your data syncs securely to the cloud. Access your workspace from any device, anytime.',
    accent: 'teal',
  },
];

const screenshots = [
  {
    img: '/screenshots/quran-reader.png',
    title: 'Quran Reader',
    desc: 'Book-style reading with Mushaf themes',
  },
  {
    img: '/screenshots/pomodoro-timer.png',
    title: 'Focus Timer',
    desc: 'Pomodoro sessions with floating player',
  },
  {
    img: '/screenshots/book-library.png',
    title: 'Book Library',
    desc: 'Track your reading with covers & notes',
  },
  {
    img: '/screenshots/kanban-board.png',
    title: 'Kanban Board',
    desc: 'Visual task management',
  },
  {
    img: '/screenshots/daily-todo.png',
    title: 'Daily Tasks',
    desc: 'Plan and track your day',
  },
  {
    img: '/screenshots/challenge-tracker.png',
    title: 'Challenges',
    desc: 'Build habits and stay consistent',
  },
];

const steps = [
  {
    num: '01',
    title: 'Create your free account',
    desc: 'Sign up in seconds with your email. Choose a unique username for your public profile.',
  },
  {
    num: '02',
    title: 'Explore the dashboard',
    desc: 'Navigate through Quran, Pomodoro, Kanban, Library, Tasks, and more from a single unified interface.',
  },
  {
    num: '03',
    title: 'Make it yours',
    desc: 'Pin widgets, customize themes, set reading goals, and build habits with challenges.',
  },
];

export function LandingPage({ onLogin, onRegister }: LandingPageProps) {
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState('');

  return (
    <div className="landing">
      {/* Navigation */}
      <nav className="landing-nav">
        <a href="/" className="landing-nav-brand">
          <img src="/logo.png" alt="Bait El-Hakma" className="landing-nav-logo" />
          <span className="landing-nav-title">Bait El-Hakma</span>
        </a>
        <div className="landing-nav-links">
          <a href="#features" className="landing-nav-link">Features</a>
          <a href="#how" className="landing-nav-link">How it Works</a>
          <button className="landing-btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }} onClick={onLogin}>
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-badge">
          <span className="landing-hero-badge-dot" />
          Free &amp; Open — No ads, no tracking
        </div>

        <h1>
          <span className="gradient-text">Bait El-Hakma</span>
          <span className="arabic-text">بيت الحكمة</span>
        </h1>

        <p className="landing-hero-sub">
          Your all-in-one productivity suite. Read the Quran, manage tasks,
          track books, and stay focused — beautifully designed, securely synced.
        </p>

        <div className="landing-hero-actions">
          <button className="landing-btn-primary" onClick={onRegister}>
            Get Started Free <ArrowRight className="w-5 h-5" />
          </button>
          <button className="landing-btn-secondary" onClick={onLogin}>
            Sign In <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="landing-hero-stats">
          <div className="landing-hero-stat">
            <div className="landing-hero-stat-num">114</div>
            <div className="landing-hero-stat-label">Surahs</div>
          </div>
          <div className="landing-hero-stat">
            <div className="landing-hero-stat-num">6236</div>
            <div className="landing-hero-stat-label">Ayahs</div>
          </div>
          <div className="landing-hero-stat">
            <div className="landing-hero-stat-num">6+</div>
            <div className="landing-hero-stat-label">Tools</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="landing-features" id="features">
        <div className="landing-section-header">
          <div className="landing-section-tag">Features</div>
          <h2 className="landing-section-title">Everything you need, in one place</h2>
          <p className="landing-section-desc">
            A complete workspace designed to help you learn, read, and be productive.
          </p>
        </div>

        <div className="landing-features-grid">
          {features.map((f, i) => (
            <div key={i} className="landing-feature-card" data-accent={f.accent}>
              <div className="landing-feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Showcase */}
      <section className="landing-showcase">
        <div className="landing-showcase-inner">
          <div className="landing-section-header">
            <div className="landing-section-tag">Screenshots</div>
            <h2 className="landing-section-title">Built with care, designed for you</h2>
            <p className="landing-section-desc">
              A modern, clean interface that makes every feature a joy to use.
            </p>
          </div>

          <div className="landing-showcase-grid">
            {screenshots.map((s, i) => (
              <div
                key={i}
                className="landing-showcase-item"
                onClick={() => { setLightboxImg(s.img); setLightboxTitle(s.title); }}
              >
                <img src={s.img} alt={s.title} loading="lazy" />
                <div className="landing-showcase-zoom">
                  <ZoomIn className="w-6 h-6" />
                </div>
                <div className="landing-showcase-overlay">
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="landing-how" id="how">
        <div className="landing-section-header">
          <div className="landing-section-tag">How It Works</div>
          <h2 className="landing-section-title">Up and running in minutes</h2>
          <p className="landing-section-desc">
            No complicated setup. Just create an account and start using all features instantly.
          </p>
        </div>

        <div className="landing-steps">
          {steps.map((s, i) => (
            <div key={i} className="landing-step">
              <div className="landing-step-num">{s.num}</div>
              <div className="landing-step-content">
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta">
        <div className="landing-cta-box">
          <Sparkles className="w-8 h-8 text-violet-400 mx-auto mb-4" />
          <h2>Ready to become more productive?</h2>
          <p>
            Join Bait El-Hakma today. Free forever, no credit card required,
            no ads, no data selling. Just pure productivity.
          </p>
          <div className="landing-cta-actions">
            <button className="landing-btn-primary" onClick={onRegister}>
              Create Free Account <ArrowRight className="w-5 h-5" />
            </button>
            <button className="landing-btn-secondary" onClick={onLogin}>
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <img src="/logo.png" alt="Bait El-Hakma" />
            <span>Bait El-Hakma</span>
          </div>
          <div className="landing-footer-links">
            <a href="#features">Features</a>
            <a href="#how">How It Works</a>
            <a href="https://github.com/meuor/Bait-El-Hakma" target="_blank" rel="noreferrer">GitHub</a>
            <a href="mailto:support@baitelhakma.dev">Support</a>
          </div>
          <div className="landing-footer-copy">
            &copy; 2026 Bait El-Hakma. All rights reserved.
          </div>
        </div>
      </footer>
      {/* Lightbox */}
      {lightboxImg && (
        <div className="landing-lightbox" onClick={() => setLightboxImg(null)}>
          <button className="landing-lightbox-close" onClick={() => setLightboxImg(null)}>
            <X className="w-6 h-6" />
          </button>
          <img src={lightboxImg} alt={lightboxTitle} />
          <div className="landing-lightbox-title">{lightboxTitle}</div>
        </div>
      )}
    </div>
  );
}
