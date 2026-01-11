import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  variant: 'income' | 'expense' | 'pending' | 'primary';
  className?: string;
  onClick?: () => void;
}

const variantStyles = {
  income: {
    bg: 'gradient-income',
    shadow: 'shadow-income',
    icon: 'bg-income-foreground/20',
    text: 'text-income-foreground',
  },
  expense: {
    bg: 'gradient-expense',
    shadow: 'shadow-expense',
    icon: 'bg-expense-foreground/20',
    text: 'text-expense-foreground',
  },
  pending: {
    bg: 'gradient-pending',
    shadow: 'shadow-soft',
    icon: 'bg-pending-foreground/20',
    text: 'text-pending-foreground',
  },
  primary: {
    bg: 'gradient-primary',
    shadow: 'shadow-primary',
    icon: 'bg-primary-foreground/20',
    text: 'text-primary-foreground',
  },
};

export function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant,
  className,
  onClick,
}: SummaryCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-2xl p-4",
        styles.bg,
        styles.shadow,
        onClick && "cursor-pointer active:scale-[0.98] transition-transform",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className={cn("text-xs font-medium opacity-80", styles.text)}>
            {title}
          </p>
          <p className={cn("text-2xl font-bold", styles.text)}>{value}</p>
          {subtitle && (
            <p className={cn("text-xs opacity-70", styles.text)}>{subtitle}</p>
          )}
        </div>
        <div className={cn("p-2 rounded-xl", styles.icon)}>
          <Icon className={cn("w-5 h-5", styles.text)} />
        </div>
      </div>
      
      {/* Decorative circles */}
      <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/5" />
    </div>
  );
}
