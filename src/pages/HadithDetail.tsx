import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Bookmark, BookmarkCheck, Copy, Share2, Camera } from 'lucide-react';
import { fetchEditions, fetchHadith, getBookShortName } from '@/services/hadithApi';
import { useBookmarks } from '@/context/BookmarkContext';
import { BadgeGroup } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cn, truncateText, isRTL } from '@/utils/helpers';
import html2canvas from 'html2canvas';
import type { Hadith, Edition } from '@/types';

export function HadithDetail() {
  const { bookId, hadithNumber } = useParams<{ bookId: string; hadithNumber: string }>();
  const { t } = useTranslation();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const cardRef = useRef<HTMLDivElement>(null);

  const [hadith, setHadith] = useState<Hadith | null>(null);
  const [editions, setEditions] = useState<Edition[]>([]);
  const [selectedEdition, setSelectedEdition] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const number = parseInt(hadithNumber || '1', 10);

  useEffect(() => {
    const loadEditions = async () => {
      const data = await fetchEditions();
      setEditions(data);

      const bookEditions = data.filter(e => e.book === bookId);
      const englishEdition = bookEditions.find(e => e.language === 'english');
      const arabicEdition = bookEditions.find(e => e.language === 'arabic');
      setSelectedEdition(englishEdition?.name || arabicEdition?.name || bookEditions[0]?.name || null);
    };

    loadEditions();
  }, [bookId]);

  useEffect(() => {
    const loadHadith = async () => {
      if (!selectedEdition) return;
      
      setLoading(true);
      const data = await fetchHadith(selectedEdition, number);
      setHadith(data);
      setLoading(false);
    };

    loadHadith();
  }, [selectedEdition, number]);

  const bookEditions = editions.filter(e => e.book === bookId);
  const bookName = bookEditions[0]?.englishName || (bookId ? getBookShortName(bookId) : '');
  const currentEdition = bookEditions.find(e => e.name === selectedEdition);
  const language = currentEdition?.language || 'en';

  const bookmarked = bookId && number ? isBookmarked(bookId, number) : false;

  const handleBookmark = () => {
    if (!bookId || !hadith) return;
    
    if (bookmarked) {
      removeBookmark(bookId, number);
    } else {
      addBookmark({
        bookId,
        bookName,
        hadithNumber: number,
        text: truncateText(hadith.text, 200),
        grade: hadith.grades?.[0]?.grade,
        language,
      });
    }
  };

  const handleCopy = async () => {
    if (!hadith) return;
    
    const text = `${t('hadith.hadithNumber', { number })}\n${bookName}\n\n${hadith.text}`;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShare = async () => {
    if (!hadith) return;

    const shareData = {
      title: `${t('hadith.hadithNumber', { number })} - ${bookName}`,
      text: truncateText(hadith.text, 200),
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await handleCopy();
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleScreenshot = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });

      const link = document.createElement('a');
      link.download = `hadith-${number}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Screenshot failed:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="min-h-[60vh]" />;
  }

  if (!hadith) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 mb-4">{t('error.notFound')}</p>
        <Link to={`/book/${bookId}`}>
          <Button>{t('nav.home')}</Button>
        </Link>
      </div>
    );
  }

  const isArabicText = isRTL(hadith.text);

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <Link
          to="/"
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          {t('nav.home')}
        </Link>
        <span className="mx-2 text-gray-300 dark:text-gray-600">/</span>
        <Link
          to={`/book/${bookId}`}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          {bookName}
        </Link>
        <span className="mx-2 text-gray-300 dark:text-gray-600">/</span>
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {t('hadith.hadithNumber', { number })}
        </span>
      </nav>

      {/* Hadith Card */}
      <div
        ref={cardRef}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-8 mb-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">{number}</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('hadith.hadithNumber', { number })}
              </h1>
              <p className="text-gray-500 dark:text-gray-400">{bookName}</p>
            </div>
          </div>

          {hadith.grades && hadith.grades.length > 0 && (
            <BadgeGroup grades={hadith.grades} />
          )}
        </div>

        {/* Language Selector */}
        {bookEditions.length > 1 && (
          <div className="flex gap-2 mb-6">
            {bookEditions.map(ed => (
              <button
                key={ed.name}
                onClick={() => setSelectedEdition(ed.name)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  selectedEdition === ed.name
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                )}
              >
                {ed.language.charAt(0).toUpperCase() + ed.language.slice(1)}
              </button>
            ))}
          </div>
        )}

        {/* Hadith Text */}
        <div
          className={cn(
            'text-lg leading-relaxed text-gray-800 dark:text-gray-200 mb-6',
            isArabicText ? 'font-arabic text-right text-2xl' : 'font-sans'
          )}
          dir={isArabicText ? 'rtl' : 'ltr'}
        >
          {hadith.text}
        </div>

        {/* Reference */}
        {hadith.reference && (
          <div className="text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-4">
            <p>{t('hadith.reference')}: Book {hadith.reference.book}, Hadith {hadith.reference.hadith}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={bookmarked ? 'primary' : 'secondary'}
          onClick={handleBookmark}
          className="gap-2"
        >
          {bookmarked ? (
            <>
              <BookmarkCheck className="w-4 h-4" />
              {t('actions.bookmarked')}
            </>
          ) : (
            <>
              <Bookmark className="w-4 h-4" />
              {t('actions.bookmark')}
            </>
          )}
        </Button>

        <Button variant="secondary" onClick={handleCopy} className="gap-2 relative">
          <Copy className="w-4 h-4" />
          {t('actions.copy')}
          {copied && (
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {t('actions.copied')}
            </span>
          )}
        </Button>

        <Button variant="secondary" onClick={handleShare} className="gap-2">
          <Share2 className="w-4 h-4" />
          {t('actions.share')}
        </Button>

        <Button variant="secondary" onClick={handleScreenshot} className="gap-2">
          <Camera className="w-4 h-4" />
          {t('actions.screenshot')}
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Link to={`/book/${bookId}/${number - 1}`}>
          <Button variant="ghost" disabled={number <= 1} className="gap-1">
            <ChevronLeft className="w-4 h-4" />
            {t('pagination.previous')}
          </Button>
        </Link>

        <Link to={`/book/${bookId}/${number + 1}`}>
          <Button variant="ghost" className="gap-1">
            {t('pagination.next')}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
