import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import localforage from 'localforage';
import type { Bookmark } from '@/types';

interface BookmarkContextType {
  bookmarks: Bookmark[];
  addBookmark: (bookmark: Omit<Bookmark, 'timestamp'>) => void;
  removeBookmark: (bookId: string, hadithNumber: number) => void;
  isBookmarked: (bookId: string, hadithNumber: number) => boolean;
  clearBookmarks: () => void;
}

const BookmarkContext = createContext<BookmarkContextType | null>(null);

const BOOKMARKS_KEY = 'hadith-bookmarks';

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        const saved = await localforage.getItem<Bookmark[]>(BOOKMARKS_KEY);
        if (saved) {
          setBookmarks(saved);
        }
      } catch (error) {
        console.error('Error loading bookmarks:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    
    loadBookmarks();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localforage.setItem(BOOKMARKS_KEY, bookmarks).catch(console.error);
    }
  }, [bookmarks, isLoaded]);

  const addBookmark = useCallback((bookmark: Omit<Bookmark, 'timestamp'>) => {
    setBookmarks(prev => {
      const exists = prev.some(
        b => b.bookId === bookmark.bookId && b.hadithNumber === bookmark.hadithNumber
      );
      if (exists) return prev;
      
      return [...prev, { ...bookmark, timestamp: Date.now() }];
    });
  }, []);

  const removeBookmark = useCallback((bookId: string, hadithNumber: number) => {
    setBookmarks(prev => 
      prev.filter(b => !(b.bookId === bookId && b.hadithNumber === hadithNumber))
    );
  }, []);

  const isBookmarked = useCallback((bookId: string, hadithNumber: number) => {
    return bookmarks.some(b => b.bookId === bookId && b.hadithNumber === hadithNumber);
  }, [bookmarks]);

  const clearBookmarks = useCallback(() => {
    setBookmarks([]);
  }, []);

  const value: BookmarkContextType = {
    bookmarks,
    addBookmark,
    removeBookmark,
    isBookmarked,
    clearBookmarks,
  };

  return <BookmarkContext.Provider value={value}>{children}</BookmarkContext.Provider>;
}

export function useBookmarks() {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
}
