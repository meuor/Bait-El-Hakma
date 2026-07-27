import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  RefreshCw,
  BookOpen,
  Heart,
  Copy,
  Sparkles,
  Quote,
  Moon,
  Sun,
  ScrollText,
} from 'lucide-react';
import { toast } from 'sonner';
import { QuranReader } from '@/components/QuranReader';

// Local dataset of Hadith
const hadithCollection = [
  {
    id: 'h1',
    arabic: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    english: 'Actions are judged by intentions, and every person will have what they intended.',
    narrator: 'Umar ibn Al-Khattab',
    source: 'Sahih al-Bukhari',
    book: '1',
  },
  {
    id: 'h2',
    arabic: 'مَنْ يُرِدِ اللَّهُ بِهِ خَيْرًا يُفَقِّهْهُ فِي الدِّينِ',
    english: 'When Allah wishes good for someone, He bestows upon them the understanding of the religion.',
    narrator: 'Muawiyah',
    source: 'Sahih al-Bukhari',
    book: '71',
  },
  {
    id: 'h3',
    arabic: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
    english: 'The best among you are those who learn the Quran and teach it.',
    narrator: 'Uthman ibn Affan',
    source: 'Sahih al-Bukhari',
    book: '61',
  },
  {
    id: 'h4',
    arabic: 'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا، سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ',
    english: 'Whoever follows a path to seek knowledge, Allah will make easy for them a path to Paradise.',
    narrator: 'Abu Hurairah',
    source: 'Sahih Muslim',
    book: '2699',
  },
  {
    id: 'h5',
    arabic: 'الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ',
    english: 'A good word is charity.',
    narrator: 'Abu Hurairah',
    source: 'Sahih al-Bukhari',
    book: '6023',
  },
  {
    id: 'h6',
    arabic: 'لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ',
    english: 'None of you truly believes until he loves for his brother what he loves for himself.',
    narrator: 'Anas ibn Malik',
    source: 'Sahih al-Bukhari',
    book: '13',
  },
  {
    id: 'h7',
    arabic: 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
    english: 'Whoever believes in Allah and the Last Day, let him speak good or remain silent.',
    narrator: 'Abu Hurairah',
    source: 'Sahih al-Bukhari',
    book: '6018',
  },
  {
    id: 'h8',
    arabic: 'إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ',
    english: 'Indeed, Allah loves those who are constantly repentant and loves those who purify themselves.',
    narrator: 'Abu Hurairah',
    source: 'Sahih Muslim',
    book: '2749',
  },
  {
    id: 'h9',
    arabic: 'الدُّنْيَا سِجْنُ الْمُؤْمِنِ وَجَنَّةُ الْكَافِرِ',
    english: 'The world is a prison for the believer and a paradise for the disbeliever.',
    narrator: 'Abu Hurairah',
    source: 'Sahih Muslim',
    book: '2956',
  },
  {
    id: 'h10',
    arabic: 'تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ',
    english: 'Your smile in the face of your brother is charity for you.',
    narrator: 'Abu Dharr',
    source: 'Jami at-Tirmidhi',
    book: '1956',
  },
];

// Local dataset of Quran verses
const quranVerses = [
  {
    id: 'q1',
    surah: 'Al-Baqarah',
    surahNumber: 2,
    ayahNumber: 286,
    arabic: 'لاَ يُكَلِّفُ اللَّهُ نَفْسًا إِلاَّ وُسْعَهَا',
    english: 'Allah does not burden a soul beyond that it can bear.',
  },
  {
    id: 'q2',
    surah: 'Ar-Rahman',
    surahNumber: 55,
    ayahNumber: 13,
    arabic: 'فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ',
    english: 'So which of the favors of your Lord would you deny?',
  },
  {
    id: 'q3',
    surah: 'Al-Inshirah',
    surahNumber: 94,
    ayahNumber: 5,
    arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
    english: 'Indeed, with hardship comes ease.',
  },
  {
    id: 'q4',
    surah: 'Al-Baqarah',
    surahNumber: 2,
    ayahNumber: 152,
    arabic: 'فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُواْ لِي وَلاَ تَكْفُرُونِ',
    english: 'So remember Me; I will remember you. And be grateful to Me and do not deny Me.',
  },
  {
    id: 'q5',
    surah: 'Ali Imran',
    surahNumber: 3,
    ayahNumber: 139,
    arabic: 'وَلاَ تَهِنُوا وَلاَ تَحْزَنُوا وَأَنتُمُ الأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ',
    english: 'So do not weaken and do not grieve, and you will be superior if you are believers.',
  },
  {
    id: 'q6',
    surah: 'At-Talaq',
    surahNumber: 65,
    ayahNumber: 2,
    arabic: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا وَيَرْزُقْهُ مِنْ حَيْثُ لاَ يَحْتَسِبُ',
    english: 'And whoever fears Allah - He will make for him a way out and will provide for him from where he does not expect.',
  },
  {
    id: 'q7',
    surah: 'Al-Ankabut',
    surahNumber: 29,
    ayahNumber: 69,
    arabic: 'وَالَّذِينَ جَاهَدُوا فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا',
    english: 'And those who strive for Us - We will surely guide them to Our ways.',
  },
  {
    id: 'q8',
    surah: 'Al-Baqarah',
    surahNumber: 2,
    ayahNumber: 286,
    arabic: 'رَبَّنَا لاَ تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا',
    english: 'Our Lord, do not impose blame upon us if we have forgotten or erred.',
  },
  {
    id: 'q9',
    surah: 'Al-Isra',
    surahNumber: 17,
    ayahNumber: 80,
    arabic: 'وَقُل رَّبِّ أَدْخِلْنِي مُدْخَلَ صِدْقٍ وَأَخْرِجْنِي مُخْرَجَ صِدْقٍ',
    english: 'And say, "My Lord, cause me to enter a sound entrance and to exit a sound exit."',
  },
  {
    id: 'q10',
    surah: 'Al-Fajr',
    surahNumber: 89,
    ayahNumber: 27,
    arabic: 'يَا أَيَّتُهَا النَّفْسُ الْمُطْمَئِنَّةُ ارْجِعِي إِلَى رَبِّكِ رَاضِيَةً مَّرْضِيَّةً',
    english: 'O reassured soul, return to your Lord, well-pleased and pleasing [to Him].',
  },
];

// Motivational quotes
const motivationalQuotes = [
  {
    id: 'm1',
    text: 'The only way to do great work is to love what you do.',
    author: 'Steve Jobs',
    category: 'Work',
  },
  {
    id: 'm2',
    text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
    author: 'Winston Churchill',
    category: 'Perseverance',
  },
  {
    id: 'm3',
    text: 'The future belongs to those who believe in the beauty of their dreams.',
    author: 'Eleanor Roosevelt',
    category: 'Dreams',
  },
  {
    id: 'm4',
    text: 'It does not matter how slowly you go as long as you do not stop.',
    author: 'Confucius',
    category: 'Persistence',
  },
  {
    id: 'm5',
    text: 'Everything you\'ve ever wanted is on the other side of fear.',
    author: 'George Addair',
    category: 'Courage',
  },
  {
    id: 'm6',
    text: 'Success is walking from failure to failure with no loss of enthusiasm.',
    author: 'Winston Churchill',
    category: 'Success',
  },
  {
    id: 'm7',
    text: 'The only limit to our realization of tomorrow will be our doubts of today.',
    author: 'Franklin D. Roosevelt',
    category: 'Belief',
  },
  {
    id: 'm8',
    text: 'Do what you can, with what you have, where you are.',
    author: 'Theodore Roosevelt',
    category: 'Action',
  },
  {
    id: 'm9',
    text: 'Everything is hard before it is easy.',
    author: 'Johann Wolfgang von Goethe',
    category: 'Learning',
  },
  {
    id: 'm10',
    text: 'Small progress is still progress.',
    author: 'Unknown',
    category: 'Progress',
  },
  {
    id: 'm11',
    text: 'Your future is created by what you do today, not tomorrow.',
    author: 'Robert Kiyosaki',
    category: 'Productivity',
  },
  {
    id: 'm12',
    text: 'The expert in anything was once a beginner.',
    author: 'Helen Hayes',
    category: 'Learning',
  },
];

export function Motivation() {
  const [currentHadith, setCurrentHadith] = useState(hadithCollection[0]);
  const [currentVerse, setCurrentVerse] = useState(quranVerses[0]);
  const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0]);
  const [favorites, setFavorites] = useState<string[]>([]);

  const getRandomItem = <T,>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)];
  };

  const refreshHadith = useCallback(() => {
    setCurrentHadith(getRandomItem(hadithCollection));
  }, []);

  const refreshVerse = useCallback(() => {
    setCurrentVerse(getRandomItem(quranVerses));
  }, []);

  const refreshQuote = useCallback(() => {
    setCurrentQuote(getRandomItem(motivationalQuotes));
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
    toast.success(favorites.includes(id) ? 'Removed from favorites' : 'Added to favorites');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  // Auto-refresh on mount
  useEffect(() => {
    refreshHadith();
    refreshVerse();
    refreshQuote();
  }, [refreshHadith, refreshVerse, refreshQuote]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">Daily Motivation</h2>
        <p className="text-muted-foreground">Find inspiration and wisdom for your journey</p>
      </div>

      <Tabs defaultValue="quran-reader" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="quran-reader" className="gap-2">
            <ScrollText className="w-4 h-4" />
            <span className="hidden sm:inline">Quran</span>
          </TabsTrigger>
          <TabsTrigger value="hadith" className="gap-2">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Hadith</span>
          </TabsTrigger>
          <TabsTrigger value="verse" className="gap-2">
            <Moon className="w-4 h-4" />
            <span className="hidden sm:inline">Verse</span>
          </TabsTrigger>
          <TabsTrigger value="quotes" className="gap-2">
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Quotes</span>
          </TabsTrigger>
        </TabsList>

        {/* Full Quran Reader Tab */}
        <TabsContent value="quran-reader">
          <QuranReader />
        </TabsContent>

        {/* Hadith Tab */}
        <TabsContent value="hadith">
          <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-500" />
                <CardTitle className="text-lg">Hadith of the Day</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleFavorite(currentHadith.id)}
                  className={favorites.includes(currentHadith.id) ? 'text-red-500' : ''}
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(currentHadith.id) ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(`${currentHadith.arabic}\n\n${currentHadith.english}\n\n— ${currentHadith.narrator}, ${currentHadith.source}`)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={refreshHadith}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-2xl font-arabic leading-relaxed mb-4" dir="rtl">
                  {currentHadith.arabic}
                </p>
                <div className="w-16 h-px bg-border mx-auto my-4" />
                <p className="text-lg italic text-muted-foreground">
                  "{currentHadith.english}"
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">{currentHadith.source}</Badge>
                <span>•</span>
                <span>Narrated by {currentHadith.narrator}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Verse of the Day Tab */}
        <TabsContent value="verse">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Quranic Verse</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleFavorite(currentVerse.id)}
                  className={favorites.includes(currentVerse.id) ? 'text-red-500' : ''}
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(currentVerse.id) ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(`${currentVerse.arabic}\n\n${currentVerse.english}\n\n— Surah ${currentVerse.surah} (${currentVerse.surahNumber}:${currentVerse.ayahNumber})`)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={refreshVerse}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-3xl font-arabic leading-relaxed mb-4" dir="rtl">
                  {currentVerse.arabic}
                </p>
                <div className="w-16 h-px bg-border mx-auto my-4" />
                <p className="text-lg italic text-muted-foreground">
                  "{currentVerse.english}"
                </p>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="text-sm">
                  Surah {currentVerse.surah} ({currentVerse.surahNumber}:{currentVerse.ayahNumber})
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quotes Tab */}
        <TabsContent value="quotes">
          <Card className="bg-gradient-to-br from-amber-500/5 to-amber-500/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <CardTitle className="text-lg">Motivational Quote</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleFavorite(currentQuote.id)}
                  className={favorites.includes(currentQuote.id) ? 'text-red-500' : ''}
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(currentQuote.id) ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(`"${currentQuote.text}"\n\n— ${currentQuote.author}`)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={refreshQuote}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <Quote className="w-8 h-8 mx-auto text-amber-500/50 mb-4" />
                <p className="text-xl italic text-muted-foreground leading-relaxed">
                  "{currentQuote.text}"
                </p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="secondary">{currentQuote.category}</Badge>
                <span className="text-muted-foreground">— {currentQuote.author}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Favorites Section */}
      {favorites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Your Favorites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {favorites.map((id) => {
                const item = 
                  hadithCollection.find(h => h.id === id) ||
                  quranVerses.find(q => q.id === id) ||
                  motivationalQuotes.find(m => m.id === id);
                
                if (!item) return null;
                
                const isHadith = 'narrator' in item;
                const isVerse = 'surah' in item;
                const isQuote = 'author' in item && !isHadith && !isVerse;
                
                return (
                  <div key={id} className="p-3 rounded-lg bg-muted/50 flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm line-clamp-2">
                        {'english' in item ? item.english : 'text' in item ? item.text : ''}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {isHadith && `Hadith — ${item.narrator}`}
                        {isVerse && `Quran — Surah ${item.surah}`}
                        {isQuote && `Quote — ${item.author}`}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500"
                      onClick={() => toggleFavorite(id)}
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Reminder */}
      <Card className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
        <CardContent className="p-6 text-center">
          <Sun className="w-8 h-8 mx-auto text-yellow-500 mb-4" />
          <p className="text-lg font-medium mb-2">Start Your Day with Intention</p>
          <p className="text-muted-foreground">
            Every morning is a new beginning. Take a moment to set your intentions 
            and make the most of this blessed day.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
