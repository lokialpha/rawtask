import { MobileLayout } from '@/components/layout/MobileLayout';
import { SummaryCard } from '@/components/ui/SummaryCard';
import { useData } from '@/contexts/DataContext';
import { TrendingUp, TrendingDown, Target, CheckCircle2 } from 'lucide-react';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

export default function Stats() {
  const { todos, money } = useData();

  const stats = useMemo(() => {
    const income = money.entries
      .filter(m => m.type === 'income')
      .reduce((sum, m) => sum + m.amount, 0);
    
    const expense = money.entries
      .filter(m => m.type === 'expense')
      .reduce((sum, m) => sum + m.amount, 0);

    const completedTasks = todos.todos.filter(t => t.completed).length;
    const paidTasks = todos.todos.filter(t => t.paymentStatus === 'paid').length;
    const unpaidTasks = todos.todos.filter(
      t => t.paymentStatus === 'unpaid' && t.completed
    ).length;

    const monthlyGoal = 5000; // Example goal
    const progress = Math.min((income / monthlyGoal) * 100, 100);

    return {
      income,
      expense,
      net: income - expense,
      completedTasks,
      paidTasks,
      unpaidTasks,
      monthlyGoal,
      progress,
    };
  }, [todos.todos, money.entries]);

  // Simple bar chart data
  const chartData = [
    { label: 'Income', value: stats.income, color: 'gradient-income' },
    { label: 'Expense', value: stats.expense, color: 'gradient-expense' },
  ];
  const maxValue = Math.max(stats.income, stats.expense, 1);

  return (
    <MobileLayout showFab={false}>
      <header className="px-5 pt-6 pb-4 safe-top">
        <h1 className="text-2xl font-bold">Stats</h1>
        <p className="text-sm text-muted-foreground mt-1">Your financial overview</p>
      </header>

      {/* Monthly Goal */}
      <section className="px-5">
        <div className="bg-card rounded-2xl p-5 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-muted-foreground">Monthly Goal</p>
              <p className="text-xl font-bold">${stats.income} / ${stats.monthlyGoal}</p>
            </div>
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-primary">
              <Target className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
          
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full gradient-primary rounded-full transition-all duration-500"
              style={{ width: `${stats.progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {stats.progress.toFixed(0)}% of your goal reached
          </p>
        </div>
      </section>

      {/* Summary Cards */}
      <section className="px-5 mt-4 grid grid-cols-2 gap-3">
        <SummaryCard
          title="Total Income"
          value={`$${stats.income}`}
          icon={TrendingUp}
          variant="income"
        />
        <SummaryCard
          title="Total Expenses"
          value={`$${stats.expense}`}
          icon={TrendingDown}
          variant="expense"
        />
      </section>

      {/* Chart */}
      <section className="px-5 mt-6">
        <h2 className="text-base font-semibold mb-4">Income vs Expense</h2>
        <div className="bg-card rounded-2xl p-5 shadow-soft space-y-4">
          {chartData.map(item => (
            <div key={item.label}>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-semibold">${item.value}</span>
              </div>
              <div className="h-4 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", item.color)}
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Task Stats */}
      <section className="px-5 mt-6 pb-6">
        <h2 className="text-base font-semibold mb-4">Task Overview</h2>
        <div className="bg-card rounded-2xl p-5 shadow-soft">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="w-12 h-12 mx-auto mb-2 bg-income-soft rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-income" />
              </div>
              <p className="text-xl font-bold">{stats.completedTasks}</p>
              <p className="text-2xs text-muted-foreground">Completed</p>
            </div>
            <div>
              <div className="w-12 h-12 mx-auto mb-2 bg-income-soft rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-income" />
              </div>
              <p className="text-xl font-bold">{stats.paidTasks}</p>
              <p className="text-2xs text-muted-foreground">Paid</p>
            </div>
            <div>
              <div className="w-12 h-12 mx-auto mb-2 bg-pending-soft rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-pending" />
              </div>
              <p className="text-xl font-bold">{stats.unpaidTasks}</p>
              <p className="text-2xs text-muted-foreground">Unpaid</p>
            </div>
          </div>
        </div>
      </section>
    </MobileLayout>
  );
}
