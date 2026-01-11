import { cn } from '@/lib/utils';
import { AlertTriangle, Clock } from 'lucide-react';

interface OverdueBadgeProps {
  daysOverdue: number;
  className?: string;
}

export function OverdueBadge({ daysOverdue, className }: OverdueBadgeProps) {
  if (daysOverdue <= 0) return null;

  const getVariant = () => {
    if (daysOverdue >= 14) {
      return {
        bg: 'bg-expense/20',
        text: 'text-expense',
        border: 'border-expense/30',
        icon: AlertTriangle,
      };
    }
    if (daysOverdue >= 7) {
      return {
        bg: 'bg-pending/20',
        text: 'text-pending-foreground',
        border: 'border-pending/30',
        icon: AlertTriangle,
      };
    }
    return {
      bg: 'bg-muted',
      text: 'text-muted-foreground',
      border: 'border-border',
      icon: Clock,
    };
  };

  const getLabel = () => {
    if (daysOverdue === 1) return '1 day overdue';
    if (daysOverdue < 7) return `${daysOverdue} days overdue`;
    if (daysOverdue < 14) return `${Math.floor(daysOverdue / 7)} week${daysOverdue >= 14 ? 's' : ''} overdue`;
    return `${Math.floor(daysOverdue / 7)} weeks overdue`;
  };

  const variant = getVariant();
  const Icon = variant.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
        variant.bg,
        variant.text,
        variant.border,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {getLabel()}
    </span>
  );
}
