import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { APP_VERSION } from '@/data/changelog';
import { ChevronDown, ChevronRight, HelpCircle, Keyboard, BookOpen, Timer, Columns3, CheckSquare, BarChart3, Sparkles, Trophy, Calendar, Play, UserCircle, Globe } from 'lucide-react';

interface HelpSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: { q: string; a: React.ReactNode }[];
}

const KeyboardShortcuts = () => (
  <div className="space-y-2">
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {[
        { keys: '/', desc: 'Quick Capture' },
        { keys: 'Esc', desc: 'Close Quick Capture / Modals' },
        { keys: 'Ctrl+K', desc: 'Toggle sidebar' },
        { keys: 'Space', desc: 'Pause/Resume timer (when focused)' },
      ].map(s => (
        <div key={s.keys} className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2 text-sm">
          <kbd className="rounded-md border bg-background px-1.5 py-0.5 font-mono text-xs font-medium">{s.keys}</kbd>
          <span className="text-muted-foreground">{s.desc}</span>
        </div>
      ))}
    </div>
  </div>
);

const sections: HelpSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: <HelpCircle className="w-4 h-4" />,
    items: [
      {
        q: 'What is Bait El-Hakma?',
        a: 'Bait El-Hakma is a productivity suite designed for deep focus, knowledge management, and personal growth. It combines a Pomodoro timer, Kanban board, book library, Quran reader, daily journal, and more in one integrated app.',
      },
      {
        q: 'Do I need an account?',
        a: 'No. You can use all features locally without signing up. Creating an account enables cloud sync so your data persists across devices.',
      },
      {
        q: 'How does cloud sync work?',
        a: 'When signed in, your data automatically syncs to a Neon PostgreSQL database. Sync happens when you make changes and on page load. You can check your sync status via the Profile page.',
      },
    ],
  },
  {
    id: 'pomodoro',
    title: 'Pomodoro Timer',
    icon: <Timer className="w-4 h-4" />,
    items: [
      {
        q: 'How do I start a focus session?',
        a: 'Navigate to the Pomodoro tab. Enter a session name (optional), link a task (optional), then click the play button in the center of the timer circle. The timer will begin counting down.',
      },
      {
        q: 'How do I use background sounds?',
        a: 'The sounds panel is on the left side of the Pomodoro page. Click any sound tile to play it. You can also upload your own audio files using the "Upload Audio" button. Adjust volume with the slider.',
      },
      {
        q: 'How do breaks work?',
        a: 'After a focus session ends, you can choose to start a short break, skip it, or end your session. Short breaks are 5 minutes by default, long breaks are 15 minutes. You can customize these durations in settings.',
      },
      {
        q: 'How do I use the timer themes?',
        a: 'Click the settings gear icon in the timer card to open timer settings. Under "Timer Theme", choose from Classic, Ocean, Forest, Sunset, Lavender, Rose, Midnight, Amber, Hourglass, or Astrolabe.',
      },
      {
        q: 'What is the MiniPlayer?',
        a: 'When a timer is running, a floating MiniPlayer appears in the bottom-left corner showing the time remaining. You can pause/resume, pin it to stay visible across all tabs, or drag it anywhere on screen.',
      },
      {
        q: 'How do I link a task to a session?',
        a: 'In the "Ready to Focus" panel, use the "Link to Task" dropdown to select a Kanban card or todo item. The session will be recorded with that task linked.',
      },
    ],
  },
  {
    id: 'kanban',
    title: 'Kanban Board',
    icon: <Columns3 className="w-4 h-4" />,
    items: [
      {
        q: 'How do I create a task?',
        a: 'Click "Add Card" at the bottom of any column. Enter a title and description. You can also use Quick Capture with the `task:` prefix to create a card in the default column.',
      },
      {
        q: 'How do I move cards between columns?',
        a: 'Drag and drop a card from one column to another. You can also use the card menu to change its column or priority.',
      },
      {
        q: 'What are labels and priorities?',
        a: 'Labels are color-coded tags you can add to cards for categorization. Priorities (Low, Medium, High) help you sort by importance. Columns have default colors but can be customized.',
      },
    ],
  },
  {
    id: 'library',
    title: 'Book Library',
    icon: <BookOpen className="w-4 h-4" />,
    items: [
      {
        q: 'How do I add a book?',
        a: 'Click the "Add Book" button and enter the title and author. You can optionally add a cover URL, tags, and start tracking your reading progress.',
      },
      {
        q: 'How do I take notes on a book?',
        a: 'Open a book and click "Add Note". You can record page numbers, your thoughts, and key takeaways. Notes are searchable and linked to the book.',
      },
      {
        q: 'How does reading progress work?',
        a: 'Set the total pages for a book and update your current page as you read. The progress bar will update automatically.',
      },
    ],
  },
  {
    id: 'todo',
    title: 'Tasks & Todos',
    icon: <CheckSquare className="w-4 h-4" />,
    items: [
      {
        q: 'How do I create a todo?',
        a: 'Use the Quick Capture bar (press "/") and type your task. Use `todo:` prefix for todos, or just type normally. You can also use the Tasks tab to manage all todos.',
      },
      {
        q: 'What is the dual calendar?',
        a: 'The todo section shows both Gregorian and Hijri (Islamic) dates side by side, helping you plan according to both calendars.',
      },
      {
        q: 'How do I set priorities?',
        a: 'Each todo can be set to Low, Medium, or High priority. High priority items are visually highlighted.',
      },
    ],
  },
  {
    id: 'stats',
    title: 'Statistics',
    icon: <BarChart3 className="w-4 h-4" />,
    items: [
      {
        q: 'What statistics are tracked?',
        a: 'The app tracks Pomodoro sessions completed, total focus time, tasks completed, current streaks, and longest streaks. Activity breakdowns are shown as pie charts grouped by activity mode.',
      },
      {
        q: 'How do streaks work?',
        a: 'Your current streak increases each day you complete at least one focus session. The longest streak records your best run.',
      },
    ],
  },
  {
    id: 'focus-video',
    title: 'Focus Video',
    icon: <Play className="w-4 h-4" />,
    items: [
      {
        q: 'How do I play a focus video?',
        a: 'Go to the Focus Video tab. Choose from the curated list of YouTube videos or paste a YouTube link. The video auto-plays when you start a focus session if video sync is enabled.',
      },
      {
        q: 'What is video sync?',
        a: 'When enabled in Pomodoro settings, the video automatically plays when your timer starts and pauses when your timer pauses. This keeps your environment aligned with your focus state.',
      },
      {
        q: 'Can I use local video files?',
        a: 'Yes. Use the local file upload option in the Focus Video tab to play video files from your computer.',
      },
    ],
  },
  {
    id: 'quran',
    title: 'Quran Reader',
    icon: <Globe className="w-4 h-4" />,
    items: [
      {
        q: 'How do I read the Quran?',
        a: 'Navigate to the Quran section (available from the Profile tab or direct link). Select a surah from the list and start reading. You can bookmark ayahs and track your progress.',
      },
      {
        q: 'How does audio playback work?',
        a: 'Tap any ayah to play its recitation. Audio auto-advances through the surah. You can switch between 13 different reciters and use repeat modes for memorization.',
      },
      {
        q: 'What is memorization mode?',
        a: 'Memorization mode hides all ayah text. Tap to reveal each ayah one by one, testing your recall. This is perfect for hifdh practice.',
      },
    ],
  },
  {
    id: 'quick-capture',
    title: 'Quick Capture',
    icon: <Keyboard className="w-4 h-4" />,
    items: [
      {
        q: 'How do I use Quick Capture?',
        a: 'Press the "/" key or click the "+" button at the bottom-right of the screen. Type your content with optional prefixes: `todo:` (task), `book:` (book entry), `session:` (focus session), `note:` (daily note), `task:` (kanban card).',
      },
      {
        q: 'What are tags?',
        a: 'Add tags by using `#tagname` in your Quick Capture text. Tags help you organize and filter your items across the app.',
      },
      {
        q: 'Can I see suggestions?',
        a: 'Yes. As you type in Quick Capture, the app shows suggestions based on your existing data. Use arrow keys to navigate and Enter to select.',
      },
    ],
  },
  {
    id: 'daily-notes',
    title: 'Daily Notes',
    icon: <Calendar className="w-4 h-4" />,
    items: [
      {
        q: 'How do I write a daily note?',
        a: 'Go to the Daily tab. You can write journal entries, reflect on your day, and tag entries for future reference. Each day gets its own note.',
      },
      {
        q: 'Can I link notes to other items?',
        a: 'Yes. You can link daily notes to books, tasks, and other entities using the link system. This creates a connected knowledge graph.',
      },
    ],
  },
  {
    id: 'challenges',
    title: 'Challenge Tracker',
    icon: <Trophy className="w-4 h-4" />,
    items: [
      {
        q: 'How do I start a challenge?',
        a: 'Go to the Challenges tab and click "New Challenge". Set a name, description, and duration (e.g., 30 days, 100 days). Mark each day as complete as you go.',
      },
      {
        q: 'Can I have multiple challenges?',
        a: 'Yes. You can create and track multiple challenges simultaneously. Each one has its own visual progress grid.',
      },
    ],
  },
  {
    id: 'motivation',
    title: 'Inspiration',
    icon: <Sparkles className="w-4 h-4" />,
    items: [
      {
        q: 'What is in the Inspire tab?',
        a: 'The Inspire tab shows a collection of Hadith, Verse of the Day, and motivational quotes to keep you inspired throughout your day.',
      },
      {
        q: 'Can I add my own quotes?',
        a: 'Currently, quotes are curated. You can browse through different categories for inspiration.',
      },
    ],
  },
  {
    id: 'profile',
    title: 'Profile & Settings',
    icon: <UserCircle className="w-4 h-4" />,
    items: [
      {
        q: 'How do I change my theme?',
        a: 'Go to Profile tab and select your preferred theme from the available options: Light, Dark, Dracula, Monokai, or GitHub.',
      },
      {
        q: 'How do I manage my data?',
        a: 'The Profile page includes a Database View where you can see all your synced data entities. You can also migrate local data to the cloud and check sync status.',
      },
      {
        q: 'What keyboard shortcuts are available?',
        a: <KeyboardShortcuts />,
      },
      {
        q: 'How do I report a bug or give feedback?',
        a: 'Visit https://github.com/meuor/Bait-El-Hakma/issues to report issues. You can also find the support email in the app footer.',
      },
    ],
  },
];

export function HelpGuide() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleSection = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  const toggleItem = (key: string) => {
    setExpandedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <HelpCircle className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Help Guide</h1>
          <p className="text-sm text-muted-foreground">
            Everything you need to know about Bait El-Hakma &middot; v{APP_VERSION}
          </p>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="space-y-3 pr-4">
          {sections.map(section => (
            <Card key={section.id} className="overflow-hidden border-border/50">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-primary">{section.icon}</span>
                  <span className="font-semibold text-sm">{section.title}</span>
                </div>
                {expanded === section.id ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </button>

              {expanded === section.id && (
                <div className="border-t border-border/50 px-5 py-3 space-y-2">
                  {section.items.map((item, idx) => {
                    const key = `${section.id}-${idx}`;
                    const isOpen = expandedItems[key];
                    return (
                      <div key={key} className="rounded-lg border border-border/40">
                        <button
                          onClick={() => toggleItem(key)}
                          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/20 transition-colors rounded-lg"
                        >
                          <span className="text-sm font-medium">{item.q}</span>
                          {isOpen ? (
                            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-3 text-sm text-muted-foreground leading-relaxed">
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
