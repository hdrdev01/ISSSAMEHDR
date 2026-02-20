import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, BookOpen } from 'lucide-react';
import { fetchEditions, groupEditionsByBook, getBookShortName } from '@/services/hadithApi';
import { Card, CardContent } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Select } from '@/components/ui/Select';
import type { Edition } from '@/types';

export function Home() {
  const { t } = useTranslation();
  const [editions, setEditions] = useState<Edition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchEditions();
        setEditions(data);
      } catch (error) {
        console.error('Failed to load editions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const languages = useMemo(() => {
    const langs = new Set(editions.map(e => e.language));
    return Array.from(langs).sort();
  }, [editions]);

  const bookGroups = useMemo(() => {
    const groups = groupEditionsByBook(editions);
    
    // Get unique books with their primary info
    const bookMap = new Map<string, { name: string; shortName: string; count: number; editions: Edition[] }>();
    
    groups.forEach((eds, book) => {
      const englishEdition = eds.find(e => e.language === 'english');
      bookMap.set(book, {
        name: englishEdition?.englishName || getBookShortName(book),
        shortName: getBookShortName(book),
        count: Math.max(...eds.map(e => e.hadithCount || 0)),
        editions: eds,
      });
    });

    return Array.from(bookMap.entries())
      .filter(([_, info]) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
          info.name.toLowerCase().includes(query) ||
          info.shortName.toLowerCase().includes(query)
        );
      })
      .filter(([_, info]) => {
        if (languageFilter === 'all') return true;
        return info.editions.some(e => e.language === languageFilter);
      })
      .sort((a, b) => a[1].name.localeCompare(b[1].name));
  }, [editions, searchQuery, languageFilter]);

  if (loading) {
    return <LoadingSpinner size="lg" className="min-h-[60vh]" />;
  }

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('home.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('home.subtitle')}
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('home.searchPlaceholder')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          />
        </div>

        <Select
          value={languageFilter}
          onChange={e => setLanguageFilter(e.target.value)}
          options={[
            { value: 'all', label: t('home.allLanguages') },
            ...languages.map(lang => ({ value: lang, label: lang.charAt(0).toUpperCase() + lang.slice(1) })),
          ]}
          className="w-full sm:w-48"
        />
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {bookGroups.map(([bookId, info]) => (
          <Link key={bookId} to={`/book/${bookId}`}>
            <Card className="h-full hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-200 cursor-pointer group">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {info.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {t('home.hadithCount', { count: info.count })}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {info.editions.slice(0, 3).map(ed => (
                        <span
                          key={ed.name}
                          className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                        >
                          {ed.language}
                        </span>
                      ))}
                      {info.editions.length > 3 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                          +{info.editions.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {bookGroups.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No collections found matching your search.
        </div>
      )}
    </div>
  );
}
