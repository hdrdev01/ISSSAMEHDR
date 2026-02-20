import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BadgeGroup } from '@/components/ui/Badge';
import { HadithActions } from './HadithActions';
import { cn, truncateText, isRTL } from '@/utils/helpers';
import type { Hadith } from '@/types';

interface HadithCardProps {
  hadith: Hadith;
  bookId: string;
  bookName: string;
  language: string;
  showFull?: boolean;
  className?: string;
}

export function HadithCard({
  hadith,
  bookId,
  bookName,
  language,
  showFull = false,
  className,
}: HadithCardProps) {
  const { t } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);
  const [showActions, setShowActions] = useState(false);

  const isArabicText = isRTL(hadith.text);
  const displayText = showFull ? hadith.text : truncateText(hadith.text, 300);

  return (
    <div
      ref={cardRef}
      className={cn(
        'bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-all duration-200 hover:shadow-md',
        className
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-semibold text-sm">
            {hadith.hadithnumber}
          </span>
          <div>
            <Link
              to={`/book/${bookId}/${hadith.hadithnumber}`}
              className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
            >
              {t('hadith.hadithNumber', { number: hadith.hadithnumber })}
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400">{bookName}</p>
          </div>
        </div>

        {hadith.grades && hadith.grades.length > 0 && (
          <BadgeGroup grades={hadith.grades} />
        )}
      </div>

      {/* Text */}
      <div
        className={cn(
          'text-gray-800 dark:text-gray-200 leading-relaxed mb-4',
          isArabicText ? 'font-arabic text-right text-lg' : 'font-sans text-base',
          showFull ? '' : 'line-clamp-3'
        )}
        dir={isArabicText ? 'rtl' : 'ltr'}
      >
        {displayText}
      </div>

      {/* Actions */}
      <div className={cn(
        'flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800 transition-opacity duration-200',
        showActions ? 'opacity-100' : 'opacity-0 sm:opacity-100'
      )}>
        {!showFull && (
          <Link
            to={`/book/${bookId}/${hadith.hadithnumber}`}
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
          >
            {t('hadith.showTranslation')} →
          </Link>
        )}
        
        <HadithActions
          hadith={hadith}
          bookId={bookId}
          bookName={bookName}
          language={language}
          cardRef={cardRef}
        />
      </div>
    </div>
  );
}
