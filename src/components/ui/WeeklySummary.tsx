import { useMemo, useState } from 'react';
import { CheckCircle2, TrendingUp, Calendar, Target, ChevronDown, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, isWithinInterval, eachDayOfInterval, isSameDay, subDays } from 'date-fns';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

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

// Calculate current streak of consecutive days with completed tasks
function calculateStreak(todos: Todo[]): { current: number; best: number } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get all unique dates with completions
  const completionDates = new Set<string>();
  todos.forEach(todo => {
    if (todo.completed) {
      const dateStr = todo.completedAt 
        ? new Date(todo.completedAt).toISOString().split('T')[0]
        : todo.dueDate;
      completionDates.add(dateStr);
    }
  });

  // Calculate current streak (going backwards from today)
  let currentStreak = 0;
  let checkDate = today;
  
  // Check if today has completions, if not start from yesterday
  const todayStr = today.toISOString().split('T')[0];
  if (!completionDates.has(todayStr)) {
    checkDate = subDays(today, 1);
  }
  
  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    if (completionDates.has(dateStr)) {
      currentStreak++;
      checkDate = subDays(checkDate, 1);
    } else {
      break;
    }
  }

  // Calculate best streak (simple approach - check last 90 days)
  let bestStreak = 0;
  let tempStreak = 0;
  for (let i = 90; i >= 0; i--) {
    const dateStr = subDays(today, i).toISOString().split('T')[0];
    if (completionDates.has(dateStr)) {
      tempStreak++;
      bestStreak = Math.max(bestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  return { current: currentStreak, best: bestStreak };
}

export function WeeklySummary({ todos, moneyEntries, formatCurrency, monthlyGoal = 0 }: WeeklySummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const streak = useMemo(() => calculateStreak(todos), [todos]);

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
      const dayCompletedTasks = completedThisWeek.filter(todo => {
        const dateToCheck = todo.completedAt ? new Date(todo.completedAt) : new Date(todo.dueDate);
        return isSameDay(dateToCheck, day);
      });
      
      const dayIncome = moneyEntries
        .filter(entry => entry.type === 'income' && isSameDay(new Date(entry.date), day))
        .reduce((sum, entry) => sum + entry.amount, 0);

      const dayExpense = moneyEntries
        .filter(entry => entry.type === 'expense' && isSameDay(new Date(entry.date), day))
        .reduce((sum, entry) => sum + entry.amount, 0);

      return {
        day: format(day, 'EEE'),
        fullDay: format(day, 'EEEE'),
        dateFormatted: format(day, 'MMM d'),
        date: day,
        completed: dayCompletedTasks.length,
        completedAmount: dayCompletedTasks.reduce((sum, t) => sum + (t.amount || 0), 0),
        income: dayIncome,
        expense: dayExpense,
        isToday: isSameDay(day, today),
        isPast: day < today,
        isFuture: day > today,
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
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="bg-card rounded-2xl p-4 shadow-soft">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">This Week</h3>
          </div>
          <div className="flex items-center gap-3">
            {/* Streak Badge */}
            {streak.current > 0 && (
              <div className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                streak.current >= 7 
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white" 
                  : streak.current >= 3 
                    ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                    : "bg-muted text-muted-foreground"
              )}>
                <Flame className={cn(
                  "w-3 h-3",
                  streak.current >= 3 && "animate-pulse"
                )} />
                <span>{streak.current}</span>
              </div>
            )}
            <span className="text-xs text-muted-foreground">{weekData.weekLabel}</span>
          </div>
        </div>

        {/* Stats */}
        <div className={cn(
          "grid gap-3 mb-4",
          streak.current > 0 ? "grid-cols-3" : "grid-cols-2"
        )}>
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
          {streak.current > 0 && (
            <div className={cn(
              "rounded-xl p-3",
              streak.current >= 7 
                ? "bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30"
                : "bg-orange-100/50 dark:bg-orange-900/20"
            )}>
              <div className="flex items-center gap-2 mb-1">
                <Flame className={cn(
                  "w-3.5 h-3.5",
                  streak.current >= 7 ? "text-orange-500" : "text-orange-500"
                )} />
                <span className="text-xs text-muted-foreground">Streak</span>
              </div>
              <p className={cn(
                "text-lg font-bold",
                streak.current >= 7 ? "text-orange-500" : "text-orange-600 dark:text-orange-400"
              )}>
                {streak.current} day{streak.current !== 1 ? 's' : ''}
              </p>
              {streak.best > streak.current && (
                <p className="text-2xs text-muted-foreground mt-0.5">
                  Best: {streak.best} days
                </p>
              )}
            </div>
          )}
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

        {/* Expand/Collapse Button */}
        <CollapsibleTrigger asChild>
          <button className="w-full mt-3 pt-3 border-t border-border flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <span>{isExpanded ? 'Hide details' : 'Show daily breakdown'}</span>
            <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", isExpanded && "rotate-180")} />
          </button>
        </CollapsibleTrigger>

        {/* Expanded Daily Details */}
        <CollapsibleContent>
          <div className="mt-3 pt-3 border-t border-border space-y-2">
            {weekData.dailyActivity.map((day, i) => (
              <div 
                key={i}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl transition-colors",
                  day.isToday 
                    ? "bg-primary/10 border border-primary/20" 
                    : day.isFuture 
                      ? "bg-muted/30" 
                      : "bg-muted/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex flex-col items-center justify-center text-xs",
                    day.isToday ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    <span className="font-bold">{format(day.date, 'd')}</span>
                    <span className="text-2xs opacity-70">{day.day}</span>
                  </div>
                  <div>
                    <p className={cn(
                      "text-sm font-medium",
                      day.isToday && "text-primary"
                    )}>
                      {day.fullDay}
                      {day.isToday && <span className="ml-1.5 text-2xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">Today</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {day.completed > 0 ? (
                        <span className="text-primary">{day.completed} task{day.completed !== 1 ? 's' : ''} done</span>
                      ) : day.isFuture ? (
                        <span>Upcoming</span>
                      ) : (
                        <span>No tasks completed</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {day.income > 0 && (
                    <p className="text-sm font-semibold text-income">+{formatCurrency(day.income)}</p>
                  )}
                  {day.expense > 0 && (
                    <p className="text-xs text-expense">-{formatCurrency(day.expense)}</p>
                  )}
                  {day.income === 0 && day.expense === 0 && !day.isFuture && (
                    <p className="text-xs text-muted-foreground">—</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}