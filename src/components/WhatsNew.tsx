import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Sparkles, Star, Zap, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChangelogEntry {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch';
  changes: {
    category: 'new' | 'improved' | 'fixed' | 'removed';
    text: string;
  }[];
}

const changelog: ChangelogEntry[] = [
  {
    version: '2.8.0',
    date: '2026-08-01',
    type: 'major',
    changes: [
      { category: 'new', text: 'Desktop app for Windows, Linux, and macOS' },
      { category: 'new', text: 'Download buttons for all platforms (Win, Linux, Mac, Web)' },
      { category: 'new', text: 'Real Islamic wallpaper backgrounds from wallhaven.cc' },
      { category: 'new', text: 'Auto-update system — check for updates from the app' },
      { category: 'new', text: 'Modernized login, signup, and password reset pages' },
      { category: 'new', text: 'Tab order profiles — save, switch, rename & delete custom layouts' },
      { category: 'new', text: 'Tab order syncs to cloud across all your devices' },
      { category: 'new', text: 'Linux builds: AppImage, deb, rpm' },
      { category: 'new', text: 'macOS builds: DMG, ZIP (universal)' },
      { category: 'improved', text: 'Landing page with animated hero section' },
      { category: 'improved', text: 'Split-layout auth pages with glassmorphism' },
      { category: 'improved', text: 'System tray integration on all platforms' },
    ],
  },
  {
    version: '2.7.0',
    date: '2026-07-15',
    type: 'minor',
    changes: [
      { category: 'new', text: 'Quick Capture widget for fast task creation' },
      { category: 'new', text: 'Command Palette (Ctrl+K) for keyboard navigation' },
      { category: 'improved', text: 'Cloud sync reliability and error handling' },
      { category: 'fixed', text: 'Tab persistence across sessions' },
    ],
  },
  {
    version: '2.6.0',
    date: '2026-07-01',
    type: 'minor',
    changes: [
      { category: 'new', text: 'Public user profiles with @username' },
      { category: 'new', text: 'Password reset via email' },
      { category: 'improved', text: 'Quran reader with 13 reciters' },
      { category: 'improved', text: 'Pomodoro timer with focus video player' },
    ],
  },
];

const categoryIcons = {
  new: <Sparkles className="w-4 h-4" />,
  improved: <Zap className="w-4 h-4" />,
  fixed: <Star className="w-4 h-4" />,
  removed: <X className="w-4 h-4" />,
};

const categoryColors = {
  new: 'hsl(var(--success-light))',
  improved: 'hsl(var(--brand-light))',
  fixed: 'hsl(var(--gold-light))',
  removed: 'hsl(var(--error))',
};

const categoryLabels = {
  new: 'New',
  improved: 'Improved',
  fixed: 'Fixed',
  removed: 'Removed',
};

const typeColors = {
  major: 'linear-gradient(135deg, hsl(var(--brand)), hsl(var(--brand-dark)))',
  minor: 'linear-gradient(135deg, hsl(var(--brand-dark)), hsl(var(--brand)))',
  patch: 'linear-gradient(135deg, hsl(var(--brand)), hsl(var(--brand-light)))',
};

interface WhatsNewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: 'auto' | 'manual';
}

const SEEN_VERSION_KEY = 'bait-el-hakma-seen-version';

export function WhatsNew({ open, onOpenChange, trigger }: WhatsNewProps) {
  const [selectedVersion, setSelectedVersion] = useState(changelog[0]?.version || '');

  useEffect(() => {
    if (trigger === 'auto') {
      const seenVersion = localStorage.getItem(SEEN_VERSION_KEY);
      const latestVersion = changelog[0]?.version;
      if (latestVersion && seenVersion !== latestVersion) {
        setTimeout(() => onOpenChange(true), 1500);
      }
    }
  }, [trigger, onOpenChange]);

  const handleClose = () => {
    localStorage.setItem(SEEN_VERSION_KEY, changelog[0]?.version || '');
    onOpenChange(false);
  };

  const selectedEntry = changelog.find(e => e.version === selectedVersion);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'hsl(0 0% 0% / 0.7)', backdropFilter: 'blur(8px)' }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="w-full max-w-2xl max-h-[80vh] rounded-2xl border overflow-hidden flex flex-col"
            style={{
              background: 'hsl(var(--surface-overlay) / 0.95)',
              borderColor: 'hsl(var(--brand) / 0.15)',
              boxShadow: '0 32px 100px hsl(0 0% 0% / 0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, hsl(var(--gold-light)), hsl(var(--gold)))' }}>
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">What's New</h2>
                  <p className="text-xs" style={{ color: 'hsl(var(--text-muted))' }}>Latest updates and features</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{ color: 'hsl(var(--text-muted))' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'hsl(var(--brand-light))'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'hsl(var(--text-muted))'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Version tabs */}
            <div className="flex gap-2 px-5 pb-3 shrink-0 overflow-x-auto">
              {changelog.map((entry) => (
                <button
                  key={entry.version}
                  onClick={() => setSelectedVersion(entry.version)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
                  style={{
                    background: selectedVersion === entry.version
                      ? 'hsl(var(--brand) / 0.15)'
                      : 'hsl(var(--brand) / 0.04)',
                    border: `1px solid ${selectedVersion === entry.version
                      ? 'hsl(var(--brand) / 0.3)'
                      : 'hsl(var(--brand) / 0.06)'}`,
                    color: selectedVersion === entry.version ? 'hsl(var(--brand-light))' : 'hsl(var(--text-muted))',
                  }}
                >
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white"
                    style={{ background: typeColors[entry.type] }}>
                    v{entry.version}
                  </span>
                  <span>{entry.date}</span>
                </button>
              ))}
            </div>

            {/* Changelog content */}
            <div className="flex-1 overflow-y-auto px-5 pb-5">
              {selectedEntry && (
                <div className="space-y-4">
                  {(['new', 'improved', 'fixed', 'removed'] as const).map((category) => {
                    const items = selectedEntry.changes.filter(c => c.category === category);
                    if (items.length === 0) return null;
                    return (
                      <div key={category}>
                        <div className="flex items-center gap-2 mb-2">
                          <span style={{ color: categoryColors[category] }}>
                            {categoryIcons[category]}
                          </span>
                          <span className="text-xs font-semibold uppercase tracking-wider"
                            style={{ color: categoryColors[category] }}>
                            {categoryLabels[category]}
                          </span>
                        </div>
                        <div className="space-y-1.5 pl-6">
                          {items.map((item, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="flex items-start gap-2 text-sm"
                              style={{ color: 'hsl(var(--brand-lighter))' }}
                            >
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ background: categoryColors[category] }} />
                              {item.text}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 pt-3 shrink-0"
              style={{ borderTop: '1px solid hsl(var(--brand) / 0.06)' }}>
              <button
                onClick={() => window.open('https://github.com/meuor/Bait-El-Hakma/releases', '_blank')}
                className="flex items-center gap-1 text-xs transition-colors"
                  style={{ color: 'hsl(var(--text-dim))' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'hsl(var(--brand-light))'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'hsl(var(--text-dim))'}
              >
                <Globe className="w-3 h-3" />
                View all releases
              </button>
              <Button
                onClick={handleClose}
                size="sm"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--brand)), hsl(var(--brand-dark)))',
                  color: 'white',
                  fontWeight: 600,
                }}
              >
                Got it!
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function useWhatsNewAutoShow() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seenVersion = localStorage.getItem(SEEN_VERSION_KEY);
    const latestVersion = changelog[0]?.version;
    if (latestVersion && seenVersion !== latestVersion) {
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  return { show, setShow };
}
