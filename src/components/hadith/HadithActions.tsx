import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bookmark, BookmarkCheck, Copy, Share2, Camera } from 'lucide-react';
import { useBookmarks } from '@/context/BookmarkContext';
import { Button } from '@/components/ui/Button';
import { cn, truncateText } from '@/utils/helpers';
import html2canvas from 'html2canvas';
import type { Hadith, RefObject } from '@/types';

interface HadithActionsProps {
  hadith: Hadith;
  bookId: string;
  bookName: string;
  language: string;
  cardRef: RefObject<HTMLDivElement>;
  className?: string;
}

export function HadithActions({
  hadith,
  bookId,
  bookName,
  language,
  cardRef,
  className,
}: HadithActionsProps) {
  const { t } = useTranslation();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const [copied, setCopied] = useState(false);

  const bookmarked = isBookmarked(bookId, hadith.hadithnumber);

  const handleBookmark = () => {
    if (bookmarked) {
      removeBookmark(bookId, hadith.hadithnumber);
    } else {
      addBookmark({
        bookId,
        bookName,
        hadithNumber: hadith.hadithnumber,
        text: truncateText(hadith.text, 200),
        grade: hadith.grades?.[0]?.grade,
        language,
      });
    }
  };

  const handleCopy = async () => {
    const text = `${t('hadith.hadithNumber', { number: hadith.hadithnumber })}\n${bookName}\n\n${hadith.text}`;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${t('hadith.hadithNumber', { number: hadith.hadithnumber })} - ${bookName}`,
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
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });

      const link = document.createElement('a');
      link.download = `hadith-${hadith.hadithnumber}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Screenshot failed:', error);
    }
  };

  return (
    <div className={cn('flex items-center gap-1 ml-auto', className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="relative"
      >
        <Copy className="w-4 h-4" />
        {copied && (
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {t('actions.copied')}
          </span>
        )}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleShare}
      >
        <Share2 className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleScreenshot}
      >
        <Camera className="w-4 h-4" />
      </Button>

      <Button
        variant={bookmarked ? 'primary' : 'ghost'}
        size="sm"
        onClick={handleBookmark}
      >
        {bookmarked ? (
          <BookmarkCheck className="w-4 h-4" />
        ) : (
          <Bookmark className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}
