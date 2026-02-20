import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bookmark as BookmarkIcon, Trash2, ExternalLink } from 'lucide-react';
import { useBookmarks } from '@/context/BookmarkContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn, formatTimestamp, isRTL } from '@/utils/helpers';

export function Bookmarks() {
  const { t } = useTranslation();
  const { bookmarks, removeBookmark, clearBookmarks } = useBookmarks();

  const handleClearAll = () => {
    if (window.confirm(t('bookmarks.confirmClear'))) {
      clearBookmarks();
    }
  };

  if (bookmarks.length === 0) {
    return (
      <div className="animate-fade-in text-center py-16">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookmarkIcon className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {t('bookmarks.empty')}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {t('bookmarks.emptyDescription')}
        </p>
        <Link to="/">
          <Button>{t('nav.home')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('bookmarks.title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {bookmarks.length} {bookmarks.length === 1 ? 'bookmark' : 'bookmarks'}
          </p>
        </div>

        <Button variant="ghost" size="sm" onClick={handleClearAll} className="text-red-600 hover:text-red-700">
          <Trash2 className="w-4 h-4 mr-1" />
          {t('bookmarks.clearAll')}
        </Button>
      </div>

      {/* Bookmarks Grid */}
      <div className="grid gap-4">
        {bookmarks
          .sort((a, b) => b.timestamp - a.timestamp)
          .map(bookmark => {
            const isArabic = isRTL(bookmark.text);
            
            return (
              <Card key={`${bookmark.bookId}-${bookmark.hadithNumber}`} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-semibold text-sm">
                          {bookmark.hadithNumber}
                        </span>
                        <div>
                          <Link
                            to={`/book/${bookmark.bookId}/${bookmark.hadithNumber}`}
                            className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                          >
                            {t('hadith.hadithNumber', { number: bookmark.hadithNumber })}
                          </Link>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {bookmark.bookName}
                          </p>
                        </div>
                        {bookmark.grade && (
                          <Badge grade={bookmark.grade} />
                        )}
                      </div>

                      {/* Text Preview */}
                      <p
                        className={cn(
                          'text-gray-700 dark:text-gray-300 text-sm line-clamp-2',
                          isArabic && 'font-arabic text-right text-base'
                        )}
                        dir={isArabic ? 'rtl' : 'ltr'}
                      >
                        {bookmark.text}
                      </p>

                      {/* Timestamp */}
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        {formatTimestamp(bookmark.timestamp)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <Link to={`/book/${bookmark.bookId}/${bookmark.hadithNumber}`}>
                        <Button variant="ghost" size="sm" className="p-2">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBookmark(bookmark.bookId, bookmark.hadithNumber)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>
    </div>
  );
}
