import { cn, getGradeColor } from '@/utils/helpers';

interface BadgeProps {
  grade: string;
  className?: string;
}

export function Badge({ grade, className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      getGradeColor(grade),
      className
    )}>
      {grade}
    </span>
  );
}

interface BadgeGroupProps {
  grades: Array<{ graded_by: string; grade: string }>;
  className?: string;
}

export function BadgeGroup({ grades, className }: BadgeGroupProps) {
  if (!grades || grades.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {grades.map((g, index) => (
        <Badge key={index} grade={g.grade} />
      ))}
    </div>
  );
}
