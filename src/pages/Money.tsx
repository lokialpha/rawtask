import { MobileLayout } from '@/components/layout/MobileLayout';
import { MoneyEntryCard } from '@/components/money/MoneyEntryCard';
import { SummaryCard } from '@/components/ui/SummaryCard';
import { mockMoneyEntries } from '@/data/mockData';
import { TrendingUp, TrendingDown, Scale } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

type Filter = 'all' | 'income' | 'expense';

export default function Money() {
  const [filter, setFilter] = useState<Filter>('all');

  const filteredEntries = mockMoneyEntries.filter(entry => {
    if (filter === 'income') return entry.type === 'income';
    if (filter === 'expense') return entry.type === 'expense';
    return true;
  });

  const summary = useMemo(() => {
    const income = mockMoneyEntries
      .filter(m => m.type === 'income')
      .reduce((sum, m) => sum + m.amount, 0);
    
    const expense = mockMoneyEntries
      .filter(m => m.type === 'expense')
      .reduce((sum, m) => sum + m.amount, 0);

    return { income, expense, net: income - expense };
  }, []);

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'income', label: 'Income' },
    { key: 'expense', label: 'Expense' },
  ];

  return (
    <MobileLayout>
      <header className="px-5 pt-6 pb-4 safe-top">
        <h1 className="text-2xl font-bold">Money</h1>
        <p className="text-sm text-muted-foreground mt-1">Track income & expenses</p>
      </header>

      {/* Summary */}
      <section className="px-5 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <SummaryCard
            title="Total Income"
            value={`$${summary.income}`}
            icon={TrendingUp}
            variant="income"
          />
          <SummaryCard
            title="Total Expenses"
            value={`$${summary.expense}`}
            icon={TrendingDown}
            variant="expense"
          />
        </div>
        
        <div
          className={cn(
            "bg-card rounded-2xl p-4 shadow-soft border-2",
            summary.net >= 0 ? "border-income/30" : "border-expense/30"
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Net Balance</p>
              <p
                className={cn(
                  "text-2xl font-bold",
                  summary.net >= 0 ? "text-income" : "text-expense"
                )}
              >
                {summary.net >= 0 ? '+' : '-'}${Math.abs(summary.net)}
              </p>
            </div>
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                summary.net >= 0
                  ? "bg-income-soft"
                  : "bg-expense-soft"
              )}
            >
              <Scale
                className={cn(
                  "w-5 h-5",
                  summary.net >= 0 ? "text-income" : "text-expense"
                )}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="px-5 mt-6 mb-4">
        <div className="flex gap-2 p-1 bg-muted rounded-xl">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                filter === f.key
                  ? "bg-card shadow-soft text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Entries */}
      <section className="px-5 pb-6 space-y-3">
        <h2 className="text-base font-semibold">Recent Transactions</h2>
        {filteredEntries.length > 0 ? (
          filteredEntries.map(entry => (
            <MoneyEntryCard key={entry.id} entry={entry} />
          ))
        ) : (
          <div className="bg-card rounded-2xl p-8 text-center shadow-soft">
            <p className="text-muted-foreground">No transactions found</p>
          </div>
        )}
      </section>
    </MobileLayout>
  );
}
