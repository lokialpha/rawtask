import { MobileLayout } from '@/components/layout/MobileLayout';
import { SummaryCard } from '@/components/ui/SummaryCard';
import { useData } from '@/contexts/DataContext';
import { useSettings } from '@/hooks/useSettings';
import { TrendingUp, TrendingDown, Target, CheckCircle2 } from 'lucide-react';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

export default function Stats() {
  const { todos, money } = useData();
  const { settings, formatCurrency } = useSettings();

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

    const monthlyGoal = settings.monthlyGoal;
    const progress = monthlyGoal > 0 ? Math.min((income / monthlyGoal) * 100, 100) : 0;

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
  }, [todos.todos, money.entries, settings.monthlyGoal]);

  // Monthly comparison chart data (last 6 months)
  const monthlyChartData = useMemo(() => {
    const months: { name: string; income: number; expense: number }[] = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear();
      const month = date.getMonth();
      
      const monthEntries = money.entries.filter(e => {
        const entryDate = new Date(e.date);
        return entryDate.getFullYear() === year && entryDate.getMonth() === month;
      });
      
      months.push({
        name: monthName,
        income: monthEntries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0),
        expense: monthEntries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0),
      });
    }
    
    return months;
  }, [money.entries]);

  // Expense breakdown by category
  const expenseByCategory = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    
    money.entries
      .filter(e => e.type === 'expense')
      .forEach(e => {
        const category = e.category || 'Other';
        categoryMap[category] = (categoryMap[category] || 0) + e.amount;
      });
    
    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [money.entries]);

  const EXPENSE_COLORS = [
    'hsl(0, 84%, 60%)',
    'hsl(25, 95%, 53%)',
    'hsl(45, 93%, 47%)',
    'hsl(262, 83%, 58%)',
    'hsl(199, 89%, 48%)',
    'hsl(142, 71%, 45%)',
    'hsl(330, 81%, 60%)',
    'hsl(210, 40%, 50%)',
  ];

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
              <p className="text-xl font-bold">{formatCurrency(stats.income)} / {formatCurrency(stats.monthlyGoal)}</p>
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
          value={formatCurrency(stats.income)}
          icon={TrendingUp}
          variant="income"
        />
        <SummaryCard
          title="Total Expenses"
          value={formatCurrency(stats.expense)}
          icon={TrendingDown}
          variant="expense"
        />
      </section>

      {/* Monthly Comparison Chart */}
      <section className="px-5 mt-6">
        <h2 className="text-base font-semibold mb-4">Monthly Trends</h2>
        <div className="bg-card rounded-2xl p-5 shadow-soft">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--income))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--income))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--expense))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--expense))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                formatter={(value: number) => [formatCurrency(value)]}
              />
              <Legend 
                verticalAlign="top" 
                height={36}
                formatter={(value) => <span className="text-xs text-muted-foreground capitalize">{value}</span>}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="hsl(var(--income))"
                strokeWidth={2}
                fill="url(#incomeGradient)"
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="hsl(var(--expense))"
                strokeWidth={2}
                fill="url(#expenseGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Chart */}
      <section className="px-5 mt-6">
        <h2 className="text-base font-semibold mb-4">Income vs Expense</h2>
        <div className="bg-card rounded-2xl p-5 shadow-soft space-y-4">
          {chartData.map(item => (
            <div key={item.label}>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-semibold">{formatCurrency(item.value)}</span>
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

      {/* Expense Breakdown Pie Chart */}
      {expenseByCategory.length > 0 && (
        <section className="px-5 mt-6">
          <h2 className="text-base font-semibold mb-4">Expense Breakdown</h2>
          <div className="bg-card rounded-2xl p-5 shadow-soft">
            <div className="flex items-center gap-4">
              <div className="w-[140px] h-[140px] flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {expenseByCategory.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                      formatter={(value: number) => [formatCurrency(value)]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2 overflow-hidden">
                {expenseByCategory.slice(0, 5).map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: EXPENSE_COLORS[index % EXPENSE_COLORS.length] }}
                    />
                    <span className="text-xs text-muted-foreground truncate flex-1">{item.name}</span>
                    <span className="text-xs font-medium">{formatCurrency(item.value)}</span>
                  </div>
                ))}
                {expenseByCategory.length > 5 && (
                  <p className="text-xs text-muted-foreground">+{expenseByCategory.length - 5} more</p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

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
