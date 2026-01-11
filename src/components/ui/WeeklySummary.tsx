import { useMemo } from 'react';
import { CheckCircle2, TrendingUp, Calendar, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, isWithinInterval, eachDayOfInterval, isSameDay } from 'date-fns';

interface Todo {
  id: string;
  completed: boolean;
  completedAt?: string;
  dueDate: string;
  amount?: number;
}

interface MoneyEntry {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  date: string;
}

interface WeeklySummaryProps {
  todos: Todo[];
  moneyEntries: MoneyEntry[];
  formatCurrency: (amount: number) => string;
  monthlyGoal?: number;
}

export function WeeklySummary({ todos, moneyEntries, formatCurrency, monthlyGoal = 0 }: WeeklySummaryProps) {
  const weekData = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Sunday
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

    // Tasks completed this week
    const completedThisWeek = todos.filter(todo => {
      if (!todo.completed) return false;
      // Use completedAt if available, otherwise check if due date is in this week
      const dateToCheck = todo.completedAt ? new Date(todo.completedAt) : new Date(todo.dueDate);
      return isWithinInterval(dateToCheck, { start: weekStart, end: weekEnd });
    });

    // Income this week
    const weeklyIncome = moneyEntries
      .filter(entry => {
        if (entry.type !== 'income') return false;
        const entryDate = new Date(entry.date);
        return isWithinInterval(entryDate, { start: weekStart, end: weekEnd });
      })
      .reduce((sum, entry) => sum + entry.amount, 0);

    // Income this month (for goal progress)
    const monthlyIncome = moneyEntries
      .filter(entry => {
        if (entry.type !== 'income') return false;
        const entryDate = new Date(entry.date);
        return isWithinInterval(entryDate, { start: monthStart, end: monthEnd });
      })
      .reduce((sum, entry) => sum + entry.amount, 0);

    // Daily activity for sparkline
    const dailyActivity = daysOfWeek.map(day => {
      const dayCompleted = completedThisWeek.filter(todo => {
        const dateToCheck = todo.completedAt ? new Date(todo.completedAt) : new Date(todo.dueDate);
        return isSameDay(dateToCheck, day);
      }).length;
      
      const dayIncome = moneyEntries
        .filter(entry => entry.type === 'income' && isSameDay(new Date(entry.date), day))
        .reduce((sum, entry) => sum + entry.amount, 0);

      return {
        day: format(day, 'EEE'),
        date: day,
        completed: dayCompleted,
        income: dayIncome,
        isToday: isSameDay(day, today),
        isPast: day < today,
      };
    });

    return {
      weekStart,
      weekEnd,
      completedCount: completedThisWeek.length,
      earnedFromTasks: completedThisWeek.reduce((sum, t) => sum + (t.amount || 0), 0),
      totalIncome: weeklyIncome,
      monthlyIncome,
      dailyActivity,
      weekLabel: `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`,
      monthLabel: format(today, 'MMMM'),
    };
  }, [todos, moneyEntries]);

  const maxCompleted = Math.max(...weekData.dailyActivity.map(d => d.completed), 1);
  const goalProgress = monthlyGoal > 0 ? Math.min((weekData.monthlyIncome / monthlyGoal) * 100, 100) : 0;
  const isGoalMet = weekData.monthlyIncome >= monthlyGoal;

  return (
    <div className="bg-card rounded-2xl p-4 shadow-soft">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">This Week</h3>
        </div>
        <span className="text-xs text-muted-foreground">{weekData.weekLabel}</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-income-soft rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-income" />
            <span className="text-xs text-muted-foreground">Earned</span>
          </div>
          <p className="text-lg font-bold text-income">{formatCurrency(weekData.totalIncome)}</p>
        </div>
        <div className="bg-primary/10 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs text-muted-foreground">Completed</span>
          </div>
          <p className="text-lg font-bold text-primary">{weekData.completedCount} tasks</p>
        </div>
      </div>

      {/* Monthly Goal Progress */}
      {monthlyGoal > 0 && (
        <div className="mb-4 p-3 bg-muted/50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className={cn("w-3.5 h-3.5", isGoalMet ? "text-income" : "text-primary")} />
              <span className="text-xs font-medium">{weekData.monthLabel} Goal</span>
            </div>
            <span className={cn("text-xs font-semibold", isGoalMet ? "text-income" : "text-foreground")}>
              {formatCurrency(weekData.monthlyIncome)} / {formatCurrency(monthlyGoal)}
            </span>
          </div>
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
                isGoalMet ? "bg-income" : "gradient-primary"
              )}
              style={{ width: `${goalProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-2xs text-muted-foreground">
              {Math.round(goalProgress)}% complete
            </span>
            {!isGoalMet && (
              <span className="text-2xs text-muted-foreground">
                {formatCurrency(monthlyGoal - weekData.monthlyIncome)} to go
              </span>
            )}
            {isGoalMet && (
              <span className="text-2xs text-income font-medium">
                🎉 Goal reached!
              </span>
            )}
          </div>
        </div>
      )}

      {/* Activity Chart */}
      <div className="flex items-end justify-between gap-1 h-16 pt-2">
        {weekData.dailyActivity.map((day, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div 
              className="w-full max-w-[24px] rounded-t-md transition-all duration-300"
              style={{ 
                height: `${Math.max((day.completed / maxCompleted) * 100, day.completed > 0 ? 20 : 0)}%`,
                minHeight: day.completed > 0 ? '8px' : '0px',
              }}
            >
              <div 
                className={cn(
                  "w-full h-full rounded-t-md",
                  day.isToday 
                    ? "bg-primary" 
                    : day.isPast 
                      ? day.completed > 0 ? "bg-primary/60" : "bg-muted"
                      : "bg-muted/50"
                )}
              />
            </div>
            <span 
              className={cn(
                "text-2xs",
                day.isToday ? "font-semibold text-primary" : "text-muted-foreground"
              )}
            >
              {day.day.charAt(0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}