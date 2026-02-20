import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Bookmark, Sun, Moon, Languages } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';

export function Navbar() {
  const { t } = useTranslation();
  const location = useLocation();
  const { theme, setTheme, settings, updateSettings } = useApp();

  const toggleTheme = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
  };

  const cycleLanguage = () => {
    const languages: Array<'en' | 'ar' | 'fr'> = ['en', 'ar', 'fr'];
    const currentIndex = languages.indexOf(settings.language);
    const nextLang = languages[(currentIndex + 1) % languages.length];
    updateSettings({ language: nextLang });
  };

  const navItems = [
    { path: '/', icon: Home, label: t('nav.home') },
    { path: '/bookmarks', icon: Bookmark, label: t('nav.bookmarks') },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ح</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white hidden sm:block">
              {t('app.title')}
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link key={path} to={path}>
                <Button
                  variant={location.pathname === path ? 'primary' : 'ghost'}
                  size="sm"
                  className="gap-1.5"
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Button>
              </Link>
            ))}

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />

            <Button
              variant="ghost"
              size="sm"
              onClick={cycleLanguage}
              className="gap-1.5"
            >
              <Languages className="w-4 h-4" />
              <span className="text-xs font-medium uppercase">
                {settings.language}
              </span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2"
            >
              {theme === 'dark' ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
