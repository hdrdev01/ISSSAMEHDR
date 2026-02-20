export interface Hadith {
  hadithnumber: number;
  arabicnumber: string | number;
  text: string;
  grades?: Grade[];
  reference?: HadithReference;
}

export interface Grade {
  graded_by: string;
  grade: string;
}

export interface HadithReference {
  book: number;
  hadith: number;
}

export interface Book {
  book: string;
  bookName: string;
  author: string;
  hadithCount: number;
  language: string;
  shortName?: string;
}

export interface Edition {
  name: string;
  book: string;
  language: string;
  englishName: string;
  sectionNumber?: number;
  hadithCount?: number;
}

export interface Section {
  number: number;
  name: string;
  hadithStartNumber: number;
  hadithEndNumber: number;
}

export interface CacheData<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

export interface Bookmark {
  bookId: string;
  bookName: string;
  hadithNumber: number;
  text: string;
  grade?: string;
  language: string;
  timestamp: number;
}

export interface AppSettings {
  language: 'en' | 'ar' | 'fr';
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
}

export type GradeFilter = 'all' | 'sahih' | 'hasan' | 'daif' | 'ungraded';

export type RefObject<T> = {
  current: T | null;
};
