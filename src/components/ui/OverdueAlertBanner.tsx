import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OverdueAlertBannerProps {
  count: number;
  totalAmount: number;
  formatCurrency: (amount: number) => string;
  onClick?: () => void;
}

export function OverdueAlertBanner({ 
  count, 
  totalAmount, 
  formatCurrency,
  onClick 
}: OverdueAlertBannerProps) {
  if (count === 0) return null;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-2xl p-4 transition-all duration-200",
        "bg-gradient-to-r from-expense/10 via-expense/5 to-expense/10",
        "border-2 border-expense/30 hover:border-expense/50",
        "active:scale-[0.98]",
        "animate-pulse-subtle"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-expense/20 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-expense" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-expense">
            {count} Overdue Unpaid Task{count > 1 ? 's' : ''}
          </p>
          <p className="text-xs text-expense/80">
            {formatCurrency(totalAmount)} pending • Tap to review
          </p>
        </div>
        <div className="flex-shrink-0">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-expense text-expense-foreground text-sm font-bold">
            {count}
          </span>
        </div>
      </div>
    </button>
  );
}
