import { useState, useRef, useEffect } from 'react';
import { motion, useInView, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  BookOpen, Timer, LayoutGrid, Library,
  Cloud, Sparkles, ArrowRight, ChevronRight, X,
  Star, Headphones, Brain, Heart, Check,
  Zap, Globe, Shield, Download, Monitor, Laptop,
} from 'lucide-react';
import { IslamicWallpaper } from './IslamicWallpaper';
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
  { src: '/screenshots/pomodoro.png', title: 'Pomodoro', desc: 'Focus timer with sessions, themes & mini-player' },
  { src: '/screenshots/focus-video.png', title: 'Focus Video', desc: 'YouTube & local video player with auto-rotate' },
  { src: '/screenshots/kanban.png', title: 'Kanban', desc: 'Drag-and-drop task management board' },
  { src: '/screenshots/library.png', title: 'Library', desc: 'Track books with progress & notes' },
  { src: '/screenshots/tasks.png', title: 'Tasks', desc: 'Daily todos with priority & categories' },
  { src: '/screenshots/stats.png', title: 'Stats', desc: 'Activity analytics & focus breakdown' },
  { src: '/screenshots/inspire.png', title: 'Inspire', desc: 'Quran, hadith & daily quotes' },
  { src: '/screenshots/challenges.png', title: 'Challenges', desc: 'Build habits with streaks & achievements' },
];

const steps = [
  { num: '01', title: 'Create your account', desc: 'Sign up in seconds with email. Pick a unique username for your public profile.', titleAr: 'أنشئ حسابك' },
  { num: '02', title: 'Explore the dashboard', desc: 'Navigate Quran, Timer, Kanban, Library, Tasks & more from one interface.', titleAr: 'استكشف لوحة التحكم' },
  { num: '03', title: 'Make it yours', desc: 'Pin widgets, customize themes, set goals, build habits. Your space, your rules.', titleAr: 'اجعله خاصاً بك' },
];

const highlights = [
  { icon: <Zap className="w-5 h-5" />, label: 'Lightning Fast' },
  { icon: <Globe className="w-5 h-5" />, label: 'Works Everywhere' },
  { icon: <Shield className="w-5 h-5" />, label: 'Privacy First' },
  { icon: <Download className="w-5 h-5" />, label: 'Desktop App' },
];

function FadeInSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
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

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

function FloatingMockup() {
  return (
    <div className="lp-mockup-wrapper">
      <div className="lp-mockup-card">
        <div className="lp-mockup-header">
          <div className="lp-mockup-dots">
            <span /><span /><span />
          </div>
          <span className="lp-mockup-title">Bait El-Hakma</span>
        </div>
        <div className="lp-mockup-body">
          <div className="lp-mockup-sidebar">
            {['Quran', 'Timer', 'Kanban', 'Books', 'Tasks'].map((item, i) => (
              <div key={item} className={`lp-mockup-nav-item ${i === 0 ? 'active' : ''}`}>
                <div className="lp-mockup-nav-icon" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="lp-mockup-content">
            <div className="lp-mockup-topbar">
              <span>Al-Fatiha</span>
              <span className="lp-mockup-badge">7 Ayahs</span>
            </div>
            <div className="lp-mockup-ayahs">
              {['بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ', 'ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', 'مَٰلِكِ يَوْمِ ٱلدِّينِ'].map((ayah, i) => (
                <div key={i} className="lp-mockup-ayah">
                  <span className="lp-mockup-ayah-num">{i + 1}</span>
                  <span className="lp-mockup-ayah-text">{ayah}</span>
                </div>
              ))}
            </div>
            <div className="lp-mockup-player">
              <div className="lp-mockup-play-btn">▶</div>
              <div className="lp-mockup-wave">
                {Array.from({ length: 20 }, (_, i) => (
                  <div key={i} className="lp-mockup-wave-bar" style={{ height: `${8 + Math.sin(i * 0.8) * 12}px` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="lp-mockup-float lp-mockup-float-1">
        <Timer className="w-5 h-5" />
        <span>25:00</span>
      </div>
      <div className="lp-mockup-float lp-mockup-float-2">
        <BookOpen className="w-4 h-4" />
        <span>Juz 1</span>
      </div>
      <div className="lp-mockup-float lp-mockup-float-3">
        <Check className="w-4 h-4" />
        <span>3/5 done</span>
      </div>
    </div>
  );
}

export function LandingPage({ onLogin, onRegister }: LandingPageProps) {
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [lightboxTitle, setLightboxTitle] = useState('');
  const [activeFeature, setActiveFeature] = useState(0);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="lp">
      {/* Navigation */}
      <motion.nav
        className="lp-nav"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <a href="/" className="lp-nav-brand">
          <img src="/img/bait-el-hakma%20logo.png" alt="Bait El-Hakma" className="lp-nav-logo" />
          <span className="lp-nav-title">Bait El-Hakma</span>
        </a>
        <div className="lp-nav-links">
          <a href="#features" className="lp-nav-link">Features</a>
          <a href="#gallery" className="lp-nav-link">Gallery</a>
          <a href="#desktop" className="lp-nav-link">Desktop App</a>
          <a href="#how" className="lp-nav-link">How it Works</a>
          <motion.button
            className="lp-btn-primary lp-btn-sm"
            onClick={onLogin}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign In
          </motion.button>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="lp-hero" ref={heroRef}>
        <IslamicWallpaper variant="hero" />
        <motion.div className="lp-hero-content" style={{ y: heroY, opacity: heroOpacity }}>
          <div className="lp-hero-left">
            <motion.div
              className="lp-hero-badge"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="lp-badge-dot" />
              <Sparkles className="w-3.5 h-3.5" />
              Free & Open Source
            </motion.div>

            <motion.h1
              className="lp-hero-title"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="lp-title-gradient">Bait El-Hakma</span>
              <span className="lp-title-arabic">بيت الحكمة</span>
            </motion.h1>

            <motion.p
              className="lp-hero-desc"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
            >
              Your intelligent productivity companion. Read the Quran with audio, manage tasks,
              track books, build habits — all beautifully designed and securely synced.
            </motion.p>

            <motion.div
              className="lp-hero-actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55 }}
            >
              <motion.button className="lp-btn-primary" onClick={onRegister} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                Get Started Free <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button className="lp-btn-secondary" onClick={onLogin} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                Sign In <ChevronRight className="w-5 h-5" />
              </motion.button>
            </motion.div>

            <motion.div
              className="lp-hero-highlights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.65 }}
            >
              {highlights.map((h, i) => (
                <div key={i} className="lp-highlight">
                  {h.icon}
                  <span>{h.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            className="lp-hero-right"
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <FloatingMockup />
          </motion.div>
        </motion.div>
      </section>

      {/* Basmalah */}
      <section className="lp-basmalah">
        <FadeInSection>
          <div className="lp-basmalah-card">
            <div className="lp-basmalah-ornament">
              <span className="lp-basmalah-line" />
              <span className="lp-basmalah-diamond">◆</span>
              <span className="lp-basmalah-line" />
            </div>
            <p className="lp-basmalah-arabic">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
            <p className="lp-basmalah-translation">In the Name of Allah, the Most Gracious, the Most Merciful</p>
            <div className="lp-basmalah-divider" />
            <h3 className="lp-basmalah-name-ar">بيت الحكمة</h3>
            <p className="lp-basmalah-subtitle-ar">— حَيْثُ يَلْتَقِي الْعِلْمُ بِالْإِيمَانِ —</p>
            <p className="lp-basmalah-desc">
              A digital sanctuary where knowledge meets faith. Read, learn, track your progress,
              and build lasting habits — all in one beautifully crafted space, free forever.
            </p>
            <div className="lp-basmalah-ornament">
              <span className="lp-basmalah-line" />
              <span className="lp-basmalah-diamond">◆</span>
              <span className="lp-basmalah-line" />
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* Features */}
      <section className="lp-features" id="features">
        <FadeInSection>
          <div className="lp-section-header">
            <span className="lp-section-tag">Features</span>
            <h2 className="lp-section-title">Everything you need, in one place</h2>
            <p className="lp-section-desc">
              From Quran recitation to productivity tools — a complete digital workspace.
            </p>
          </div>
        </FadeInSection>

        <div className="lp-features-grid">
          {features.map((f, i) => (
            <motion.div
              key={i}
              className={`lp-feature-card ${activeFeature === i ? 'lp-feature-active' : ''}`}
              data-accent={f.accent}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
              onClick={() => setActiveFeature(i)}
            >
              <div className="lp-feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p className="lp-feature-title-ar">{f.titleAr}</p>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="lp-stats">
        <div className="lp-stats-inner">
          {[
            { value: 114, label: 'Surahs', suffix: '' },
            { value: 6236, label: 'Ayahs', suffix: '' },
            { value: 13, label: 'Reciters', suffix: '' },
            { value: 8, label: 'Features', suffix: '' },
            { value: 100, label: 'Free', suffix: '%' },
          ].map((s, i) => (
            <div key={i} className="lp-stat">
              <div className="lp-stat-value"><Counter end={s.value} suffix={s.suffix} /></div>
              <div className="lp-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section className="lp-gallery" id="gallery">
        <FadeInSection>
          <div className="lp-section-header">
            <span className="lp-section-tag">Gallery</span>
            <h2 className="lp-section-title">See it in action</h2>
            <p className="lp-section-desc">
              Every feature crafted with care for a delightful experience.
            </p>
          </div>
        </FadeInSection>

        <div className="lp-gallery-grid">
          {screenshots.map((s, i) => (
            <motion.div
              key={i}
              className={`lp-gallery-item lp-gallery-${i % 3 === 0 ? 'wide' : 'normal'}`}
              onClick={() => { setLightboxImg(s.src); setLightboxTitle(s.title); }}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ scale: 1.03, zIndex: 10 }}
            >
              <img src={s.src} alt={s.title} />
              <div className="lp-gallery-overlay">
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="lp-how" id="how">
        <FadeInSection>
          <div className="lp-section-header">
            <span className="lp-section-tag">How It Works</span>
            <h2 className="lp-section-title">Up and running in minutes</h2>
            <p className="lp-section-desc">
              No complicated setup. Just create an account and start using all features instantly.
            </p>
          </div>
        </FadeInSection>

        <div className="lp-steps">
          <div className="lp-steps-line" />
          {steps.map((s, i) => (
            <motion.div
              key={i}
              className="lp-step"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="lp-step-num">{s.num}</div>
              <div className="lp-step-content">
                <h3>{s.title}</h3>
                <p className="lp-step-arabic">{s.titleAr}</p>
                <p>{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Desktop App Banner */}
      <section className="lp-desktop" id="desktop">
        <FadeInSection>
          <div className="lp-desktop-card">
            <div className="lp-desktop-left">
              <Monitor className="w-12 h-12 text-violet-400 mb-4" />
              <h2>Also available as a Desktop App</h2>
              <p>Download Bait El-Hakma for Windows. Same powerful features, native experience, offline support.</p>
              <div className="lp-desktop-features">
                {['Offline Access', 'System Tray', 'Auto Updates', 'Native Feel'].map((f, i) => (
                  <div key={i} className="lp-desktop-feature">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <div className="lp-desktop-actions">
                <motion.a
                  href="https://github.com/meuor/Bait-El-Hakma/releases/latest"
                  target="_blank"
                  rel="noreferrer"
                  className="lp-btn-primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Laptop className="w-5 h-5" />
                  Download for Windows
                </motion.a>
                <span className="lp-desktop-version">v2.8.0 • NSIS Installer</span>
              </div>
            </div>
            <div className="lp-desktop-right">
              <div className="lp-desktop-mockup">
                <div className="lp-desktop-screen">
                  <div className="lp-desktop-appbar">
                    <span className="lp-desktop-appbar-dot" />
                    <span className="lp-desktop-appbar-dot" />
                    <span className="lp-desktop-appbar-dot" />
                  </div>
                  <div className="lp-desktop-content">
                    <div className="lp-desktop-sidebar">
                      <div className="lp-desktop-nav-item active" /><div className="lp-desktop-nav-item" /><div className="lp-desktop-nav-item" />
                    </div>
                    <div className="lp-desktop-main">
                      <div className="lp-desktop-line" /><div className="lp-desktop-line short" /><div className="lp-desktop-line" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* CTA */}
      <section className="lp-cta">
        <div className="lp-cta-glow" />
        <motion.div
          className="lp-cta-box"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Star className="w-10 h-10 text-amber-400 mx-auto mb-4" />
          </motion.div>
          <h2>Ready to transform your productivity?</h2>
          <p>
            Join Bait El-Hakma today. Free forever, no credit card, no ads, no tracking.
            Just pure focus and spiritual growth.
          </p>
          <div className="lp-cta-actions">
            <motion.button className="lp-btn-primary" onClick={onRegister} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              Create Free Account <ArrowRight className="w-5 h-5" />
            </motion.button>
            <motion.button className="lp-btn-secondary" onClick={onLogin} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              Sign In
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <img src="/img/bait-el-hakma%20logo.png" alt="Bait El-Hakma" className="lp-footer-logo" />
            <span>Bait El-Hakma</span>
          </div>
          <div className="lp-footer-links">
            <a href="#features">Features</a>
            <a href="#gallery">Gallery</a>
            <a href="#desktop">Desktop App</a>
            <a href="#how">How It Works</a>
            <a href="https://github.com/meuor/Bait-El-Hakma/releases/latest" target="_blank" rel="noreferrer">
              <Download className="w-3.5 h-3.5 inline mr-1" />
              Download
            </a>
            <a href="https://github.com/meuor/Bait-El-Hakma" target="_blank" rel="noreferrer">GitHub</a>
            <a href="mailto:support@baitelhakma.dev">Support</a>
          </div>
          <div className="lp-footer-copy">
            &copy; 2026 Bait El-Hakma — House of Wisdom
          </div>
        </div>
      </footer>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImg && (
          <motion.div
            className="lp-lightbox"
            onClick={() => setLightboxImg(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.button
              className="lp-lightbox-close"
              onClick={() => setLightboxImg(null)}
              whileHover={{ rotate: 90 }}
            >
              <X className="w-6 h-6" />
            </motion.button>
            <motion.img
              src={lightboxImg}
              alt={lightboxTitle}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
            <motion.div
              className="lp-lightbox-title"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              {lightboxTitle}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
