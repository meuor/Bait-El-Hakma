export const APP_VERSION = '2.1.0';

export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  titleAr: string;
  changes: {
    type: 'new' | 'improved' | 'fixed' | 'sync';
    text: string;
    textAr: string;
  }[];
}

export const SYNCED_DATA_LABELS: { key: string; label: string; labelAr: string }[] = [
  { key: 'bookmarks', label: 'Quran bookmarks & last read position', labelAr: 'marks last read' },
  { key: 'completedSurahs', label: 'Completed surahs progress', labelAr: 'surahs completed' },
  { key: 'dailyCompleted', label: 'Daily reading completion', labelAr: 'daily reading' },
  { key: 'dailyPages', label: 'Daily reading page settings', labelAr: 'daily reading settings' },
  { key: 'mushafTheme', label: 'Mushaf font theme preference', labelAr: 'mushaf theme' },
  { key: 'kanban', label: 'Kanban boards, columns & cards', labelAr: 'Kanban boards & cards' },
  { key: 'books', label: 'Book library & reading notes', labelAr: 'books & reading notes' },
  { key: 'pomodoro', label: 'Pomodoro session history', labelAr: 'Pomodoro sessions' },
  { key: 'todos', label: 'Daily tasks & todos', labelAr: 'daily tasks' },
  { key: 'challenges', label: 'Challenge tracker progress', labelAr: 'challenges' },
  { key: 'settings', label: 'App settings & preferences', labelAr: 'settings' },
  { key: 'profile', label: 'Profile info, avatar & username', labelAr: 'profile info' },
];

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '2.1.0',
    date: 'July 2026',
    title: 'Quran Reader v2 — Audio & Memorization',
    titleAr: 'القرآن كريم — الإصدار الثاني',
    changes: [
      { type: 'new', text: 'Inline audio player — tap any ayah to play with auto-advance through the surah', textAr: 'تشغيل صوتي inline — اضغط أي آية لتشغيلها مع التقدم التلقائي' },
      { type: 'new', text: '13 reciters — Alafasy, Husary, Minshawi, Sudais, Ajmi, Hudhaify, Abdul Basit & more', textAr: '13 قارئ — العفاسي، الحصري، المنطاوي، السديس، العجمي، الحذيفي، عبدالباسط' },
      { type: 'new', text: 'Repeat modes — repeat a single ayah infinitely or 3 times then auto-advance', textAr: 'أوضاع التكرار — تكرار آية إلى النهاية أو 3 مرات ثم التقدم' },
      { type: 'new', text: 'Memorization mode — hide all ayahs and tap to reveal one by one for self-testing', textAr: 'وضع الحفظ — إخفاء جميع الآيات ثم الضغط لكشفها واحدة تلو الأخرى' },
      { type: 'new', text: 'Quran Dashboard — Juz grid, weekly activity chart, 16 achievement badges', textAr: 'لوحة تحكم القرآن — شبكة الأجزاء، رسم بياني أسبوعي، 16 شارة إنجاز' },
      { type: 'new', text: 'Auto-load more ayahs — audio playback automatically loads upcoming ayahs', textAr: 'تحميل تلقائي — التحميل التلقائي للآيات القادمة أثناء التشغيل' },
      { type: 'new', text: 'Mushaf themes — switch between Madina 1441, Madina Classic, and Unicode', textAr: 'ثيمات المصحف — التبديل بين المصحف المريني والمدینین كلاسیك والیونیکود' },
      { type: 'improved', text: 'Medina-style layout — centered ayahs with ornamental verse markers ﴿١﴾', textAr: 'تنسيق المصحف — آيات متوسطة مع علامات آية مزخرفة' },
      { type: 'improved', text: 'Basmalah only shows as header for Surah Al-Baqarah, stripped from all ayahs', textAr: 'بسم الله تظهر كعنوان لسورة البقرة فقط، محفوظة من جميع الآيات' },
      { type: 'sync', text: 'Quran progress syncs to cloud — bookmarks, completed surahs, theme, daily reading', textAr: 'ت syncing تقدم القرآن — العلامات، السور المكتملة، الثيم، القراءة اليومية' },
    ],
  },
  {
    version: '2.0.0',
    date: 'July 2026',
    title: 'Authentication, Cloud Sync & Public Profiles',
    titleAr: 'المصادقة والمزامنة والس profiles العامة',
    changes: [
      { type: 'new', text: 'Full authentication — register, login, password reset via email (Resend API)', textAr: 'تسجيل دخول كامل — تسجيل، دخول، إعادة تعيين كلمة المرور عبر البريد الإلكتروني' },
      { type: 'new', text: 'Cloud sync — all data synced to Neon PostgreSQL database', textAr: 'المزامنة السحابية — جميع البيانات مزامنة مع قاعدة بيانات Neon PostgreSQL' },
      { type: 'new', text: 'Username system — choose a username at registration, share public profile at /@username', textAr: 'نظام أسماء المستخدمين — اختر اسم مستخدم عند التسجيل، شارك ملفك الشخصي' },
      { type: 'new', text: 'Public profiles — view any user\'s profile at bait-el-hakma.vercel.app/@username', textAr: 'الملفات العامة — شاهد ملف أي مستخدم' },
      { type: 'new', text: 'Welcome email on registration with getting started guide', textAr: 'رسالة ترحيب عند التسجيل مع دليل البدء' },
      { type: 'new', text: 'Profile pictures — upload avatar (stored as base64)', textAr: 'صور الملف الشخصي — رفع صورة رمزية' },
      { type: 'improved', text: 'Data migration tool to import existing local data to cloud', textAr: 'أداة نقل البيانات — استيراد البيانات المحلية إلى السحابة' },
      { type: 'fixed', text: 'Fixed 500 errors on API endpoints — getUserFromRequest header handling', textAr: 'إصلاح أخطاء 500 في نقاط الوصول — معالجة ترويسات HTTP' },
      { type: 'fixed', text: 'Fixed snake_case to camelCase mapping for all API responses', textAr: 'إصلاح تحويل snake_case إلى camelCase في جميع الاستجابات' },
    ],
  },
  {
    version: '1.5.0',
    date: 'July 2026',
    title: 'Landing Page, SEO & PWA',
    titleAr: 'صفحة الهبوط وتحسين محركات البحث وتطبيق الويب',
    changes: [
      { type: 'new', text: 'Modern landing page with hero, features grid, and screenshot gallery', textAr: 'صفحة هبوط حديثة مع البطل وشبكة الميزات ومعرض الصور' },
      { type: 'new', text: 'SEO — meta tags, Open Graph, Twitter Cards, JSON-LD structured data', textAr: 'تحسين محركات البحث — وسوم meta، Open Graph، Twitter Cards، JSON-LD' },
      { type: 'new', text: 'PWA — installable with shortcuts for Quran, Timer, and Tasks', textAr: 'تطبيق ويب — قابل للتثبيت مع اختصارات للقرآن والموقت والمهام' },
      { type: 'new', text: 'robots.txt and sitemap.xml for search engines', textAr: 'robots.txt و sitemap.xml لمحركات البحث' },
      { type: 'new', text: 'Footer with Support email, Report Issue, and GitHub links', textAr: 'تذييل مع بريد الدعم وإبلاغ مشكلة وروابط GitHub' },
    ],
  },
  {
    version: '1.0.0',
    date: 'June 2026',
    title: 'Initial Release — Productivity Suite',
    titleAr: 'الإصدار الأول — حزمة الإنتاجية',
    changes: [
      { type: 'new', text: 'Pomodoro Timer — customizable focus/break, circular SVG progress, sound alerts', textAr: 'مؤقت بومودورو — مؤقت تركيز/استراحة قابل للتعديل' },
      { type: 'new', text: 'Focus Video Player — YouTube support, PiP, auto-rotate, 12 curated videos', textAr: 'مشغل فيديو التركيز — دعم YouTube، صورة في صورة، تدوير تلقائي' },
      { type: 'new', text: 'Kanban Board — drag & drop, color labels, GTD/PARA columns', textAr: 'لوحة كانبان — سحب وإفلات، ملصقات ملونة، أعمدة GTD/PARA' },
      { type: 'new', text: 'Book Library — reading tracker, progress bars, notes with page numbers', textAr: 'مكتبة كتب — متتبع قراءة، أشرطة تقدم، ملاحظات مع أرقام الصفحات' },
      { type: 'new', text: 'Daily Todo — priority levels, dual calendar (Gregorian & Hijri)', textAr: 'مهام يومية — مستويات أولوية، تقويم مزدوج (ميلادي وهجري)' },
      { type: 'new', text: 'Activity Statistics — interactive charts, achievements, streaks', textAr: 'إحصائيات النشاط — رسوم بيانية تفاعلية، إنجازات، سلاسل' },
      { type: 'new', text: 'Challenge Tracker — custom day-based challenges with visual grid', textAr: 'متتبع التحديات — تحديات مخصصة بناءً على الأيام' },
      { type: 'new', text: 'Motivation — Hadith collection, Verse of the Day, motivational quotes', textAr: 'التحفيز — مجموعة أحاديث، آية اليوم، اقتباسات تحفيزية' },
      { type: 'new', text: '5 themes — Light, Dark, Dracula, Monokai, GitHub', textAr: '5 ثيمات — فاتح، داكرولا، دراكولا، مونوكاي، GitHub' },
      { type: 'new', text: 'MiniPlayer — floating Pomodoro timer & video player across all tabs', textAr: 'MiniPlayer — مؤقت بومودورو ومشغل فيديو عائم عبر جميع التبويبات' },
    ],
  },
];
