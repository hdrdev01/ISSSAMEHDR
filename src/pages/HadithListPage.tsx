import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, BookOpen } from 'lucide-react';
import { fetchEditions, getBookShortName } from '@/services/hadithApi';
import { useHadiths } from '@/hooks/useHadiths';
import { HadithCard } from '@/components/hadith/HadithCard';
import { GradeFilter as GradeFilterComponent } from '@/components/hadith/GradeFilter';
import { Pagination } from '@/components/ui/Pagination';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import type { Edition, GradeFilter } from '@/types';

const HADITHS_PER_PAGE = 25;

export function HadithListPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const { t } = useTranslation();
  const [editions, setEditions] = useState<Edition[]>([]);
  const [selectedEdition, setSelectedEdition] = useState<string | null>(null);
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadEditions = async () => {
      const data = await fetchEditions();
      setEditions(data);
      
      // Auto-select English edition, fall back to first available
      const bookEditions = data.filter(e => e.book === bookId);
      const englishEdition = bookEditions.find(e => e.language === 'english');
      const arabicEdition = bookEditions.find(e => e.language === 'arabic');
      setSelectedEdition(englishEdition?.name || arabicEdition?.name || bookEditions[0]?.name || null);
    };

    loadEditions();
  }, [bookId]);

  const { hadiths, loading, error } = useHadiths(selectedEdition);

  const bookEditions = useMemo(() => 
    editions.filter(e => e.book === bookId),
    [editions, bookId]
  );

  const bookName = useMemo(() => {
    const edition = bookEditions[0];
    return edition?.englishName || (bookId ? getBookShortName(bookId) : '');
  }, [bookEditions, bookId]);

  const filteredHadiths = useMemo(() => {
    if (gradeFilter === 'all') return hadiths;

    return hadiths.filter(h => {
      const grades = h.grades || [];
      if (grades.length === 0) return gradeFilter === 'ungraded';
      
      const gradeText = grades.map(g => g.grade.toLowerCase()).join(' ');
      
      switch (gradeFilter) {
        case 'sahih':
          return gradeText.includes('sahih');
        case 'hasan':
          return gradeText.includes('hasan') && !gradeText.includes('sahih');
        case 'daif':
          return gradeText.includes('daif') || gradeText.includes('weak');
        case 'ungraded':
          return grades.length === 0;
        default:
          return true;
      }
    });
  }, [hadiths, gradeFilter]);

  const totalPages = Math.ceil(filteredHadiths.length / HADITHS_PER_PAGE);
  const paginatedHadiths = useMemo(() => {
    const start = (currentPage - 1) * HADITHS_PER_PAGE;
    return filteredHadiths.slice(start, start + HADITHS_PER_PAGE);
  }, [filteredHadiths, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [gradeFilter, selectedEdition]);

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          {t('error.retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          {t('nav.home')}
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {bookName}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('home.hadithCount', { count: hadiths.length })}
            </p>
          </div>
        </div>

        {/* Edition and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={selectedEdition || ''}
            onChange={e => setSelectedEdition(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {bookEditions.map(ed => (
              <option key={ed.name} value={ed.name}>
                {ed.language.charAt(0).toUpperCase() + ed.language.slice(1)}
              </option>
            ))}
          </select>

          <GradeFilterComponent
            value={gradeFilter}
            onChange={setGradeFilter}
          />
        </div>
      </div>

      {/* Hadiths List */}
      {loading ? (
        <LoadingSpinner size="lg" className="py-12" />
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {paginatedHadiths.map(hadith => (
              <HadithCard
                key={hadith.hadithnumber}
                hadith={hadith}
                bookId={bookId || ''}
                bookName={bookName}
                language={bookEditions.find(e => e.name === selectedEdition)?.language || 'en'}
              />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            {t('pagination.showing', {
              from: (currentPage - 1) * HADITHS_PER_PAGE + 1,
              to: Math.min(currentPage * HADITHS_PER_PAGE, filteredHadiths.length),
              total: filteredHadiths.length,
            })}
          </p>
        </>
      )}
    </div>
  );
}
