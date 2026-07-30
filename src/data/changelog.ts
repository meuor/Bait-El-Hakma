export const APP_VERSION = '2.6.0';

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
    version: '2.6.0',
    date: 'August 2026',
    title: 'Tab Reordering, Drag-and-Drop & Native Audio Player',
    titleAr: 'إعادة ترتيب التبويبات، السحب والإفلات ومشغل الصوت الأصلي',
    changes: [
      { type: 'new', text: 'Tab reordering — rearrange section tabs via drag-and-drop; Profile and Help stay pinned at the end', textAr: 'إعادة ترتيب التبويبات — رتب أقسامك بالسحب والإفلات؛ الملف الشخصي والمساعدة مثبتان في النهاية' },
      { type: 'new', text: 'Native audio file picker with browser controls — choose and play audio files directly in the Pomodoro sounds panel', textAr: 'منتقي ملفات صوتي أصلي مع عناصر تحكم المتصفح — اختر وشغل ملفات صوتية مباشرة في لوحة أصوات بومودورو' },
      { type: 'fixed', text: 'Tab order now persists across page refreshes and syncs to local storage', textAr: 'ترتيب التبويبات يُحفظ الآن بعد تحديث الصفحة ويُزامن مع التخزين المحلي' },
      { type: 'improved', text: 'TabOrderDialog redesigned with HTML5 drag-and-drop, order numbers, reset button, and shadcn Tooltip', textAr: 'إعادة تصميم حوار ترتيب التبويبات مع السحب والإفلات HTML5، أرقام الترتيب، زر إعادة التعيين، وتلميح أدوات shadcn' },
    ],
  },
  {
    version: '2.5.0',
    date: 'August 2026',
    title: 'Pinned Timer Fix, Help Guide & UI Improvements',
    titleAr: 'إصلاح الموقت المثبت، دليل المساعدة وتحسينات الواجهة',
    changes: [
      { type: 'fixed', text: 'Pinned timer pause/resume now works — global TOGGLE_TIMER action MiniPlayer can dispatch', textAr: 'إصلاح إيقاف/استئناف الموقت المثبت — إجراء TOGGLE_TIMER عالمي يمكن لـ MiniPlayer إرساله' },
      { type: 'fixed', text: 'YouTube sound links verified — 432Hz Focus, Library, Forest Walk now use reliable URLs', textAr: 'التحقق من روابط يوتيوب — 432Hz Focus و Library و Forest Walk تستخدم روابط موثوقة الآن' },
      { type: 'fixed', text: 'Link to Task dropdown shows Kanban tasks grouped by category instead of random todos', textAr: 'قائمة ربط المهمة تعرض مهام كانبان مجمعة حسب الفئة بدلاً من المهام العشوائية' },
      { type: 'new', text: 'Close (X) button on Quick Capture FAB expanded card', textAr: 'إضافة زر إغلاق (X) على بطاقة الالتقاط السريع الموسعة' },
      { type: 'new', text: 'In-app Help Guide — comprehensive manual covering all app features with keyboard shortcuts', textAr: 'دليل مساعدة مدمج — دليل شامل يغطي جميع ميزات التطبيق مع اختصارات لوحة المفاتيح' },
    ],
  },
  {
    version: '2.4.0',
    date: 'July 2026',
    title: 'Knowledge Graph Redesign & Pomodoro Sounds Panel',
    titleAr: 'إعادة تصميم الرسم البياني للمعرفة ولوحة أصوات بومودورو',
    changes: [
      { type: 'improved', text: 'Knowledge Graph redesigned — curved edges, animated node entrance, left-click pan, glass-morphism toolbar', textAr: 'إعادة تصميم الرسم البياني — حواف منحنية، دخول متحرك للعقد، تحريك بالضغط الأيسر، شريط أدوات زجاجي' },
      { type: 'new', text: 'Dedicated background sounds panel in Pomodoro — always-visible side panel replaces popover picker', textAr: 'لوحة أصوات خلفية مخصصة في بومودورو — لوحة جانبية مرئية دائمًا بدلاً من المنتقي المنبثق' },
      { type: 'new', text: 'Local audio upload — choose audio files from your PC as background sounds in Pomodoro', textAr: 'رفع صوت محلي — اختر ملفات صوتية من جهازك كأصوات خلفية في بومودورو' },
      { type: 'new', text: 'Focus Time and Reading ambient sound options added to Pomodoro', textAr: 'إضافة خيارات أصوات محيطة للتركيز والقراءة في بومودورو' },
      { type: 'fixed', text: 'Fixed Forest and Night Sounds YouTube links in Pomodoro', textAr: 'إصلاح روابط يوتيوب للغابة وأصوات الليل في بومودورو' },
      { type: 'improved', text: 'Graph section removed — Knowledge Graph tab and component deleted to simplify navigation', textAr: 'إزالة قسم الرسم البياني — حذف تبويب الرسم البياني والمكون لتبسيط التنقل' },
    ],
  },
  {
    version: '2.3.0',
    date: 'July 2026',
    title: 'Bug Fixes & Data Safety',
    titleAr: 'إصلاح الأخطاء وسلامة البيانات',
    changes: [
      { type: 'fixed', text: 'Fixed DatabaseView crash on profile page — missing entityType prop', textAr: 'إصلاح عطل DatabaseView في صفحة الملف الشخصي' },
      { type: 'fixed', text: 'Fixed blank white page after sign-in — undefined entityType and GraphView tags crash', textAr: 'إصلاح الصفحة البيضاء بعد تسجيل الدخول' },
      { type: 'fixed', text: 'Fixed Quran data loss on localStorage clear — cloud pull now retries after sign-in, sync waits for cloud load', textAr: 'إصلاح فقدان بيانات القرآن عند مسح التخزين المحلي' },
      { type: 'fixed', text: 'Fixed Pomodoro timer SVG hourglass path interpolation (template literal bug)', textAr: 'إصلاح مسار الساعة الرملية SVG في مؤقت بومودورو' },
      { type: 'improved', text: 'Entity data normalization — ensures tags/links defaults on all loaded entities', textAr: 'تحسين تطبيع بيانات الكيانات — إضافة حقول tags/links افتراضية' },
      { type: 'improved', text: 'Quran cloud sync is now safe — prevents empty state from overwriting cloud data', textAr: 'تحسين مزامنة القرآن — منع الكتابة فوق البيانات السحابية بالحالة الفارغة' },
    ],
  },
  {
    version: '2.2.0',
    date: 'July 2026',
    title: 'Pomodoro Overhaul, Draggable Widgets & Book Pages',
    titleAr: 'تحديث بومودورو، أدوات قابلة للسحب، وصفحات الكتب',
    changes: [
      { type: 'new', text: 'Pomodoro activity modes — pick what you are working on (Reading, Coding, Working, etc.)', textAr: 'أوضاع نشاط بومودورو — اختر ما تعمل عليه (قراءة، برمجة، عمل، إلخ)' },
      { type: 'new', text: 'Custom session names & task linking — name each focus session and link it to a todo', textAr: 'أسماء جلسات مخصصة وربط المهام — تسمية كل جلسة تركيز وربطها بمهمة' },
      { type: 'new', text: 'Manual break control — choose when to start/end/skip breaks after each focus session', textAr: 'تحكم يدوي بالاستراحة — اختر متى تبدأ/تنهي/تتجاوز الاستراحة' },
      { type: 'new', text: '8 timer themes — Classic, Ocean, Forest, Sunset, Lavender, Rose, Midnight, Amber + Hourglass', textAr: '8 ثيمات للمؤقت — كلاسيك، أوشن، فورست، سنست، لافندر، روز، منتصف الليل، عنبر + ساعة رملية' },
      { type: 'new', text: 'Hourglass sand animation — animated sand clock that empties as time passes', textAr: 'رسوم متحركة للساعة الرملية — ساعة رملية تفرغ مع مرور الوقت' },
      { type: 'new', text: 'Draggable pinned widgets — move timer and video anywhere on screen', textAr: 'أدوات مثبتة قابلة للسحب — حرك المؤقت والفيديو إلى أي مكان' },
      { type: 'new', text: 'App minimize mode — collapse the entire app into a floating draggable timer', textAr: 'وضع تصغير التطبيق — تصغير التطبيق بالكامل إلى مؤقت عائم قابل للسحب' },
      { type: 'new', text: 'Notion-like book pages — full page view with rich content blocks (heading, text, image, link, divider)', textAr: 'صفحات كتب مشابهة لـ Notion — عرض صفحة كاملة مع كتل محتوى غنية' },
      { type: 'new', text: 'Activity breakdown chart — pie chart of focus time grouped by activity mode', textAr: 'رسم بياني لتحليل النشاط — رسم دائري لوقت التركيز حسب وضع النشاط' },
      { type: 'improved', text: 'Video sync — timer pause stops video, resume plays it; video stays visible but paused', textAr: 'مزامنة الفيديو — إيقاف المؤقت يوقف الفيديو، الاستئناف يشغله' },
      { type: 'improved', text: 'Ready to Focus panel sits beside the timer on desktop', textAr: 'لوحة جاهز للتركيز بجانب المؤقت على سطح المكتب' },
      { type: 'fixed', text: 'Video no longer disappears on timer pause — shows paused state instead', textAr: 'لم يعد الفيديو يختفي عند إيقاف المؤقت — يظهر حالة التوقف' },
      { type: 'fixed', text: 'CSS @import order issue causing Vercel build failure', textAr: 'إصلاح مشكلة ترتيب CSS @import التي تسبب فشل البناء' },
      { type: 'new', text: 'Astrolabe timer theme — planispheric astrolabe SVG with rotating alidade pointer', textAr: 'ثيم الأسطرلاب — أسطرلاب SVG مع مؤشر دوار' },
      { type: 'improved', text: 'Hourglass theme — elegant glass frame, wooden caps, glass reflection, curved sand surfaces, more particles', textAr: 'تحسين ثيم الساعة الرملية — إطار زجاجي أنيق، أغطية خشبية، انعكاس زجاجي، أسطح رملية منحنية، جسيمات أكثر' },
      { type: 'improved', text: 'Landing page screenshots — replaced static PNGs with inline SVG feature previews that match actual app UI', textAr: 'تحسين لقطات شاشة الصفحة الرئيسية — استبدال صور PNG الثابتة بمعاينات SVG مضمنة تطابق واجهة التطبيق الفعلية' },
      { type: 'fixed', text: 'YouTube links — verified all 12 focus videos, replaced 6 broken links with working alternatives', textAr: 'إصلاح روابط يوتيوب — التحقق من جميع فيديوهات التركيز الـ12، استبدال 6 روابط معطلة ببدائل عاملة' },
    ],
  },
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
