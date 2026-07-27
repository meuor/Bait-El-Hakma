import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Sparkles, Cloud, Sparkle, Wrench, Zap,
  ChevronDown, ChevronUp, ShieldCheck,
} from 'lucide-react';
import { APP_VERSION, CHANGELOG, SYNCED_DATA_LABELS, type ChangelogEntry } from '@/data/changelog';

const TYPE_CONFIG = {
  new: { icon: Sparkles, label: 'New', color: 'text-emerald-500 bg-emerald-500/10' },
  improved: { icon: Zap, label: 'Improved', color: 'text-blue-500 bg-blue-500/10' },
  fixed: { icon: Wrench, label: 'Fixed', color: 'text-orange-500 bg-orange-500/10' },
  sync: { icon: Cloud, label: 'Synced', color: 'text-violet-500 bg-violet-500/10' },
} as const;

const VERSION_KEY = 'bait-el-hakma-seen-version';

function hasSeenVersion(): boolean {
  try {
    return localStorage.getItem(VERSION_KEY) === APP_VERSION;
  } catch {
    return false;
  }
}

function markVersionSeen() {
  try {
    localStorage.setItem(VERSION_KEY, APP_VERSION);
  } catch {}
}

function ChangelogSection({ entry, defaultOpen }: { entry: ChangelogEntry; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border/50 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left"
      >
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs font-mono">v{entry.version}</Badge>
            <span className="text-xs text-muted-foreground">{entry.date}</span>
          </div>
          <p className="text-sm font-semibold mt-1">{entry.title}</p>
          <p className="text-xs text-muted-foreground" dir="rtl">{entry.titleAr}</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-2">
          {entry.changes.map((change, i) => {
            const cfg = TYPE_CONFIG[change.type];
            const Icon = cfg.icon;
            return (
              <div key={i} className="flex items-start gap-2.5 text-sm">
                <span className={`shrink-0 w-5 h-5 rounded-md flex items-center justify-center mt-0.5 ${cfg.color}`}>
                  <Icon className="w-3 h-3" />
                </span>
                <div className="flex-1 min-w-0">
                  <p>{change.text}</p>
                  <p className="text-xs text-muted-foreground mt-0.5" dir="rtl">{change.textAr}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface WhatsNewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: 'auto' | 'manual';
}

export function WhatsNew({ open, onOpenChange, trigger = 'manual' }: WhatsNewProps) {
  const [activeTab, setActiveTab] = useState<'changelog' | 'sync'>('changelog');

  useEffect(() => {
    if (!open) return;
    if (trigger === 'auto') markVersionSeen();
  }, [open, trigger]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkle className="w-5 h-5 text-primary" />
            What's New
          </DialogTitle>
          <DialogDescription dir="rtl">
            ما الجديد في بيت الحكمة
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-1 bg-muted/50 p-1 rounded-lg shrink-0">
          <Button
            variant={activeTab === 'changelog' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('changelog')}
            className="flex-1 gap-1.5 text-xs"
          >
            <Sparkle className="w-3.5 h-3.5" /> Changelog
          </Button>
          <Button
            variant={activeTab === 'sync' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('sync')}
            className="flex-1 gap-1.5 text-xs"
          >
            <Cloud className="w-3.5 h-3.5" /> Cloud Sync
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {activeTab === 'changelog' && (
            <>
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground">Current version</p>
                <p className="text-lg font-bold text-primary font-mono">v{APP_VERSION}</p>
              </div>
              {CHANGELOG.map((entry) => (
                <ChangelogSection
                  key={entry.version}
                  entry={entry}
                  defaultOpen={entry.version === APP_VERSION}
                />
              ))}
            </>
          )}

          {activeTab === 'sync' && (
            <>
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">Your data is safe across all devices</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Sign in on any device and all your progress is automatically restored from the cloud.
                      Your data is encrypted and stored securely in our database.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1" dir="rtl">
                      سجّل الدخول على أي جهاز وستُستعاد جميع تقدمك تلقائياً من السحابة. بياناتك مشفرة ومحفوظة بأمان.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                  What syncs to the cloud
                </p>
                <p className="text-xs text-muted-foreground px-1" dir="rtl">ما الذي يتم مزامنته مع السحابة</p>
                {SYNCED_DATA_LABELS.map((item) => (
                  <div key={item.key} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/20 border border-border/30">
                    <Cloud className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground" dir="rtl">{item.labelAr}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-muted/30 rounded-xl p-3 text-xs text-muted-foreground space-y-1">
                <p>• Changes auto-sync after 1.5 seconds of inactivity</p>
                <p>• Retries automatically if sync fails (3 second delay)</p>
                <p>• Works offline — data saves locally and syncs when online</p>
                <p className="mt-2" dir="rtl">
                  • التغييرات تُزامن تلقائياً بعد 1.5 ثانية من عدم النشاط
                  <br />
                  • إعادة المحاولة التلقائية عند فشل المزامنة
                  <br />
                  • يعمل بدون إنترنت — البيانات تُحفظ محلياً وتُزامن عند الاتصال
                </p>
              </div>
            </>
          )}
        </div>

        <div className="shrink-0 pt-2">
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function useWhatsNewAutoShow() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!hasSeenVersion()) {
      const timer = setTimeout(() => setShow(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  return { show, setShow };
}
