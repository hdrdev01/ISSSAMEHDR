import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/helpers';
import type { GradeFilter } from '@/types';

interface GradeFilterProps {
  value: GradeFilter;
  onChange: (filter: GradeFilter) => void;
  className?: string;
}

export function GradeFilter({ value, onChange, className }: GradeFilterProps) {
  const { t } = useTranslation();

  const filters: Array<{ value: GradeFilter; label: string }> = [
    { value: 'all', label: t('filter.all') },
    { value: 'sahih', label: t('filter.sahih') },
    { value: 'hasan', label: t('filter.hasan') },
    { value: 'daif', label: t('filter.daif') },
    { value: 'ungraded', label: t('filter.ungraded') },
  ];

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {filters.map(filter => (
        <button
          key={filter.value}
          onClick={() => onChange(filter.value)}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
            value === filter.value
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
