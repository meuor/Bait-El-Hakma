import { useState, useRef, useEffect } from 'react';
import { motion, useInView, useAnimation, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Timer, LayoutGrid, Library, CheckSquare,
  Cloud, Sparkles, ArrowRight, ChevronRight, X, ZoomIn,
  Star, BookMarked, Headphones, Brain, Heart,
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
    titleAr: 'المصحف الشريف',
    desc: 'Read the entire Quran with Mushaf themes, verse bookmarks, inline audio with 13 reciters, memorization mode, and daily reading tracker.',
    accent: 'gold',
  },
  {
    icon: <Headphones className="w-6 h-6" />,
    title: 'Audio & Recitation',
    titleAr: 'الصوت والتلاوة',
    desc: 'Tap any ayah to play with auto-advance. Choose from Alafasy, Minshawi, Husary & more. Repeat modes help with memorization.',
    accent: 'emerald',
  },
  {
    icon: <Timer className="w-6 h-6" />,
    title: 'Pomodoro Timer',
    titleAr: 'مؤقت التركيز',
    desc: 'Stay focused with customizable intervals, session tracking, and a floating mini-player across all tabs.',
    accent: 'sapphire',
  },
  {
    icon: <LayoutGrid className="w-6 h-6" />,
    title: 'Kanban Board',
    titleAr: 'لوحة المهام',
    desc: 'Organize tasks visually with drag-and-drop columns. Perfect for GTD and project management.',
    accent: 'ruby',
  },
  {
    icon: <Library className="w-6 h-6" />,
    title: 'Book Library',
    titleAr: 'مكتبة الكتب',
    desc: 'Track your reading with covers, progress bars, tags, and personal notes per page.',
    accent: 'amber',
  },
  {
    icon: <Brain className="w-6 h-6" />,
    title: 'Challenge Tracker',
    titleAr: 'تحديات يومية',
    desc: 'Build habits with custom day-based challenges. Visual grids, streaks, and progress tracking.',
    accent: 'amethyst',
  },
  {
    icon: <Cloud className="w-6 h-6" />,
    title: 'Cloud Sync',
    titleAr: 'مزامنة سحابية',
    desc: 'All data syncs securely. Access your workspace from any device, zero setup.',
    accent: 'teal',
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: 'Free & Open',
    titleAr: 'مجاني ومفتوح',
    desc: 'No ads, no tracking, no paywall. Built with love for the community. Forever free.',
    accent: 'rose',
  },
];

const screenshots = [
  { img: '/screenshots/quran-reader.png', title: 'Quran Reader', desc: 'Full Mushaf with audio & memorization', size: 'tall' },
  { img: '/screenshots/pomodoro-timer.png', title: 'Focus Timer', desc: 'Pomodoro with floating mini-player', size: 'wide' },
  { img: '/screenshots/book-library.png', title: 'Book Library', desc: 'Track books with notes & progress', size: 'square' },
  { img: '/screenshots/kanban-board.png', title: 'Kanban Board', desc: 'Visual drag-and-drop task management', size: 'wide' },
  { img: '/screenshots/daily-todo.png', title: 'Daily Tasks', desc: 'Plan your day with dual calendar', size: 'square' },
  { img: '/screenshots/challenge-tracker.png', title: 'Challenges', desc: 'Build habits with streaks & grids', size: 'tall' },
];

const steps = [
  { num: '01', title: 'Create your account', desc: 'Sign up in seconds with email. Pick a unique username for your public profile.', titleAr: 'أنشئ حسابك' },
  { num: '02', title: 'Explore the dashboard', desc: 'Navigate Quran, Timer, Kanban, Library, Tasks & more from one interface.', titleAr: 'استكشف لوحة التحكم' },
  { num: '03', title: 'Make it yours', desc: 'Pin widgets, customize themes, set goals, build habits. Your space, your rules.', titleAr: 'اجعله خاصاً بك' },
];

function FadeInSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}

function Counter({ end, suffix = '', duration = 2 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export function LandingPage({ onLogin, onRegister }: LandingPageProps) {
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState('');

  return (
    <div className="landing">
      <div className="landing-orb landing-orb-1" />
      <div className="landing-orb landing-orb-2" />
      <div className="landing-orb landing-orb-3" />
      <div className="landing-pattern" />

      {/* Navigation */}
      <motion.nav
        className="landing-nav"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <a href="/" className="landing-nav-brand">
          <img src="/logo.png" alt="Bait El-Hakma" className="landing-nav-logo" />
          <span className="landing-nav-title">Bait El-Hakma</span>
        </a>
        <div className="landing-nav-links">
          <a href="#features" className="landing-nav-link">Features</a>
          <a href="#screenshots" className="landing-nav-link">Screenshots</a>
          <a href="#how" className="landing-nav-link">How it Works</a>
          <motion.button
            className="landing-btn-primary"
            style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
            onClick={onLogin}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign In
          </motion.button>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-glow" />
        <motion.div
          className="landing-hero-badge"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span className="landing-hero-badge-dot" />
          <Sparkles className="w-3.5 h-3.5" />
          Free & Open — No ads, no tracking
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <span className="gradient-text">Bait El-Hakma</span>
          <span className="arabic-text">بيت الحكمة</span>
        </motion.h1>

        <motion.p
          className="landing-hero-sub"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          Your intelligent productivity companion. Read the Quran with audio, manage tasks,
          track books, build habits — all beautifully designed and securely synced.
        </motion.p>

        <motion.div
          className="landing-hero-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          <motion.button className="landing-btn-primary" onClick={onRegister} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            Get Started Free <ArrowRight className="w-5 h-5" />
          </motion.button>
          <motion.button className="landing-btn-secondary" onClick={onLogin} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            Sign In <ChevronRight className="w-5 h-5" />
          </motion.button>
        </motion.div>

        <motion.div
          className="landing-hero-stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
        >
          <div className="landing-hero-stat">
            <div className="landing-hero-stat-num">114</div>
            <div className="landing-hero-stat-label">Surahs</div>
          </div>
          <div className="landing-hero-stat">
            <div className="landing-hero-stat-num">6,236</div>
            <div className="landing-hero-stat-label">Ayahs</div>
          </div>
          <div className="landing-hero-stat">
            <div className="landing-hero-stat-num">13</div>
            <div className="landing-hero-stat-label">Reciters</div>
          </div>
          <div className="landing-hero-stat">
            <div className="landing-hero-stat-num">8</div>
            <div className="landing-hero-stat-label">Tools</div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="landing-features" id="features">
        <FadeInSection>
          <div className="landing-section-header">
            <div className="landing-section-tag">Features</div>
            <h2 className="landing-section-title">Everything you need, in one place</h2>
            <p className="landing-section-desc">
              From Quran recitation to productivity tools — a complete digital workspace.
            </p>
          </div>
        </FadeInSection>

        <div className="landing-features-grid">
          {features.map((f, i) => (
            <motion.div
              key={i}
              className="landing-feature-card"
              data-accent={f.accent}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
            >
              <div className="landing-feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p className="landing-feature-title-ar">{f.titleAr}</p>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Counter */}
      <section className="landing-stats-section">
        <div className="landing-stats-grid">
          <div className="landing-stat-item">
            <div className="landing-stat-num"><Counter end={114} /></div>
            <div className="landing-stat-label">Surahs</div>
          </div>
          <div className="landing-stat-item">
            <div className="landing-stat-num"><Counter end={6236} /></div>
            <div className="landing-stat-label">Ayahs</div>
          </div>
          <div className="landing-stat-item">
            <div className="landing-stat-num"><Counter end={13} /></div>
            <div className="landing-stat-label">Reciters</div>
          </div>
          <div className="landing-stat-item">
            <div className="landing-stat-num"><Counter end={8} /></div>
            <div className="landing-stat-label">Features</div>
          </div>
          <div className="landing-stat-item">
            <div className="landing-stat-num"><Counter end={100} suffix="%" /></div>
            <div className="landing-stat-label">Free</div>
          </div>
        </div>
      </section>

      {/* Screenshots */}
      <section className="landing-showcase" id="screenshots">
        <FadeInSection>
          <div className="landing-section-header">
            <div className="landing-section-tag">Gallery</div>
            <h2 className="landing-section-title">See it in action</h2>
            <p className="landing-section-desc">
              Every feature crafted with care for a delightful experience.
            </p>
          </div>
        </FadeInSection>

        <div className="landing-showcase-grid">
          {screenshots.map((s, i) => (
            <motion.div
              key={i}
              className={`landing-showcase-item landing-showcase-${s.size}`}
              onClick={() => { setLightboxImg(s.img); setLightboxTitle(s.title); }}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ scale: 1.03, zIndex: 10 }}
            >
              <img src={s.img} alt={s.title} loading="lazy" />
              <div className="landing-showcase-zoom">
                <ZoomIn className="w-6 h-6" />
              </div>
              <div className="landing-showcase-overlay">
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="landing-how" id="how">
        <FadeInSection>
          <div className="landing-section-header">
            <div className="landing-section-tag">How It Works</div>
            <h2 className="landing-section-title">Up and running in minutes</h2>
            <p className="landing-section-desc">
              No complicated setup. Just create an account and start using all features instantly.
            </p>
          </div>
        </FadeInSection>

        <div className="landing-steps">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              className="landing-step"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
            >
              <div className="landing-step-num">{s.num}</div>
              <div className="landing-step-content">
                <h3>{s.title}</h3>
                <p className="landing-step-arabic">{s.titleAr}</p>
                <p>{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta">
        <div className="landing-cta-glow" />
        <motion.div
          className="landing-cta-box"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Star className="w-10 h-10 text-amber-400 mx-auto mb-4" />
          </motion.div>
          <h2>Ready to transform your productivity?</h2>
          <p>
            Join Bait El-Hakma today. Free forever, no credit card, no ads, no tracking.
            Just pure focus and spiritual growth.
          </p>
          <div className="landing-cta-actions">
            <motion.button className="landing-btn-primary" onClick={onRegister} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              Create Free Account <ArrowRight className="w-5 h-5" />
            </motion.button>
            <motion.button className="landing-btn-secondary" onClick={onLogin} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              Sign In
            </motion.button>
          </div>
        </motion.div>
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
            <a href="#screenshots">Gallery</a>
            <a href="#how">How It Works</a>
            <a href="https://github.com/meuor/Bait-El-Hakma" target="_blank" rel="noreferrer">GitHub</a>
            <a href="mailto:support@baitelhakma.dev">Support</a>
          </div>
          <div className="landing-footer-copy">
            &copy; 2026 Bait El-Hakma — House of Wisdom
          </div>
        </div>
      </footer>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImg && (
          <motion.div
            className="landing-lightbox"
            onClick={() => setLightboxImg(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.button
              className="landing-lightbox-close"
              onClick={() => setLightboxImg(null)}
              whileHover={{ rotate: 90 }}
            >
              <X className="w-6 h-6" />
            </motion.button>
            <motion.img
              src={lightboxImg}
              alt={lightboxTitle}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
            <motion.div
              className="landing-lightbox-title"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {lightboxTitle}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
