import { cn } from '@/lib/utils';
import { MoneyEntry } from '@/types';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MoneyEntryCardProps {
  entry: MoneyEntry;
}

export function MoneyEntryCard({ entry }: MoneyEntryCardProps) {
  const isIncome = entry.type === 'income';

  return (
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
      </div>
    </div>
  );
}
