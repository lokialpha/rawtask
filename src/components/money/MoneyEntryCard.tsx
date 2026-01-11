import { cn } from '@/lib/utils';
import { MoneyEntry } from '@/types';
import { SwipeableCard } from '@/components/ui/SwipeableCard';
import { TrendingUp, TrendingDown, Pencil, Trash2 } from 'lucide-react';

interface MoneyEntryCardProps {
  entry: MoneyEntry;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export function MoneyEntryCard({ entry, onEdit, onDelete, showActions = true }: MoneyEntryCardProps) {
  const isIncome = entry.type === 'income';

  const cardContent = (
    <div className="bg-card rounded-2xl p-4 shadow-soft">
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            isIncome ? "gradient-income shadow-income" : "gradient-expense shadow-expense"
          )}
        >
          {isIncome ? (
            <TrendingUp className="w-5 h-5 text-income-foreground" />
          ) : (
            <TrendingDown className="w-5 h-5 text-expense-foreground" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {entry.description || entry.category}
          </p>
          <p className="text-xs text-muted-foreground">{entry.category}</p>
        </div>

        {/* Amount */}
        <p
          className={cn(
            "text-base font-bold",
            isIncome ? "text-income" : "text-expense"
          )}
        >
          {isIncome ? '+' : '-'}${entry.amount}
        </p>

        {/* Desktop action buttons */}
        {showActions && (
          <div className="hidden sm:flex items-center gap-1 ml-2">
            <button
              onClick={() => onEdit?.(entry.id)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Pencil className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => onDelete?.(entry.id)}
              className="p-2 rounded-lg hover:bg-expense-soft transition-colors"
            >
              <Trash2 className="w-4 h-4 text-expense" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (!showActions) {
    return cardContent;
  }

  return (
    <>
      {/* Mobile with swipe */}
      <div className="sm:hidden">
        <SwipeableCard
          onEdit={() => onEdit?.(entry.id)}
          onDelete={() => onDelete?.(entry.id)}
        >
          {cardContent}
        </SwipeableCard>
      </div>
      {/* Desktop without swipe */}
      <div className="hidden sm:block">
        {cardContent}
      </div>
    </>
  );
}
