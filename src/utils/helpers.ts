import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatHadithNumber(num: number | string): string {
  return typeof num === 'number' ? num.toLocaleString() : String(num);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

export function getGradeColor(grade: string): string {
  const normalizedGrade = grade.toLowerCase();
  if (normalizedGrade.includes('sahih')) {
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  }
  if (normalizedGrade.includes('hasan')) {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  }
  if (normalizedGrade.includes('daif') || normalizedGrade.includes('weak')) {
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  }
  return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
}

export function getGradeLabel(grade: string, language: string): string {
  const normalizedGrade = grade.toLowerCase();
  const labels: Record<string, Record<string, string>> = {
    sahih: { en: 'Sahih (Authentic)', ar: 'صحيح', fr: 'Sahih (Authentique)' },
    hasan: { en: 'Hasan (Good)', ar: 'حسن', fr: 'Hasan (Bon)' },
    daif: { en: 'Daif (Weak)', ar: 'ضعيف', fr: 'Daif (Faible)' },
  };
  
  for (const [key, label] of Object.entries(labels)) {
    if (normalizedGrade.includes(key)) {
      return label[language] || label.en;
    }
  }
  return grade;
}

export function isRTL(text: string): boolean {
  const arabicPattern = /[\u0600-\u06FF]/;
  return arabicPattern.test(text);
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}
