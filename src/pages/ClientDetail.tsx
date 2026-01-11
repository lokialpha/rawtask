import { MobileLayout } from '@/components/layout/MobileLayout';
import { useData } from '@/contexts/DataContext';
import { useSettings } from '@/hooks/useSettings';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { cn } from '@/lib/utils';
import { ArrowLeft, CheckCircle2, Circle, Clock, TrendingUp, Pencil, Trash2, Calendar, ArrowUpDown, BarChart3 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const bgColorMap: Record<string, string> = {
  blue: 'bg-client-blue/10',
  purple: 'bg-client-purple/10',
  pink: 'bg-client-pink/10',
  teal: 'bg-client-teal/10',
  orange: 'bg-client-orange/10',
};

const dotColorMap: Record<string, string> = {
  blue: 'bg-client-blue',
  purple: 'bg-client-purple',
  pink: 'bg-client-pink',
  teal: 'bg-client-teal',
  orange: 'bg-client-orange',
};

const chartColorMap: Record<string, string> = {
  blue: 'hsl(210, 90%, 55%)',
  purple: 'hsl(270, 75%, 60%)',
  pink: 'hsl(330, 80%, 60%)',
  teal: 'hsl(175, 70%, 45%)',
  orange: 'hsl(25, 95%, 55%)',
};

type FilterType = 'all' | 'completed' | 'pending' | 'unpaid';
type SortType = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

export default function ClientDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { clients, todos, money } = useData();
  const { formatCurrency } = useSettings();
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('date-desc');

  const client = clients.getClient(id || '');

  const clientData = useMemo(() => {
    if (!client) return null;

    const clientTodos = todos.todos.filter(t => t.clientId === client.id);

    const clientIncome = money.entries
      .filter(m => {
        const linkedTodo = todos.todos.find(t => t.id === m.linkedTodoId);
        return linkedTodo?.clientId === client.id && m.type === 'income';
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const totalIncome = clientIncome.reduce((sum, m) => sum + m.amount, 0);
    const completedTasks = clientTodos.filter(t => t.completed).length;
    const unpaidTasks = clientTodos.filter(t => t.paymentStatus === 'unpaid' && t.completed).length;
    const pendingAmount = clientTodos
      .filter(t => t.paymentStatus === 'unpaid' && t.completed)
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    return {
      client,
      todos: clientTodos,
      income: clientIncome,
      totalIncome,
      completedTasks,
      totalTasks: clientTodos.length,
      unpaidTasks,
      pendingAmount,
    };
  }, [client, todos.todos, money.entries]);

  const filteredAndSortedTodos = useMemo(() => {
    if (!clientData) return [];
    
    let filtered = [...clientData.todos];
    
    // Apply filter
    switch (filter) {
      case 'completed':
        filtered = filtered.filter(t => t.completed);
        break;
      case 'pending':
        filtered = filtered.filter(t => !t.completed);
        break;
      case 'unpaid':
        filtered = filtered.filter(t => t.paymentStatus === 'unpaid' && t.completed);
        break;
    }
    
    // Apply sort
    switch (sort) {
      case 'date-desc':
        filtered.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
        break;
      case 'date-asc':
        filtered.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        break;
      case 'amount-desc':
        filtered.sort((a, b) => (b.amount || 0) - (a.amount || 0));
        break;
      case 'amount-asc':
        filtered.sort((a, b) => (a.amount || 0) - (b.amount || 0));
        break;
    }
    
    return filtered;
  }, [clientData, filter, sort]);

  // Generate monthly income chart data (last 6 months)
  const incomeChartData = useMemo(() => {
    if (!clientData) return [];
    
    const months: { month: string; income: number; label: string }[] = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
      
      const monthIncome = clientData.income
        .filter(entry => entry.date.startsWith(monthKey))
        .reduce((sum, entry) => sum + entry.amount, 0);
      
      months.push({
        month: monthKey,
        label: monthLabel,
        income: monthIncome,
      });
    }
    
    return months;
  }, [clientData]);

  const hasChartData = incomeChartData.some(d => d.income > 0);

  if (!clientData) {
    return (
      <MobileLayout showFab={false}>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Client not found</p>
        </div>
      </MobileLayout>
    );
  }

  const handleDeleteTask = (taskId: string) => {
    setDeleteTaskId(taskId);
  };

  const confirmDeleteTask = () => {
    if (deleteTaskId) {
      todos.deleteTodo(deleteTaskId);
      toast.success('Task deleted');
      setDeleteTaskId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <MobileLayout showFab={false}>
      {/* Header */}
      <header className="px-5 pt-6 pb-4 safe-top">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{clientData.client.name}</h1>
              <span className={cn("w-3 h-3 rounded-full", dotColorMap[clientData.client.color])} />
            </div>
            <p className="text-sm text-muted-foreground">Client details</p>
          </div>
          <button
            onClick={() => navigate(`/clients/${id}/edit`)}
            className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
          >
            <Pencil className="w-5 h-5" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl p-3 shadow-soft text-center">
            <p className="text-lg font-bold text-income">{formatCurrency(clientData.totalIncome)}</p>
            <p className="text-2xs text-muted-foreground">Total Income</p>
          </div>
          <div className="bg-card rounded-xl p-3 shadow-soft text-center">
            <p className="text-lg font-bold">{clientData.completedTasks}/{clientData.totalTasks}</p>
            <p className="text-2xs text-muted-foreground">Completed</p>
          </div>
          <div className="bg-card rounded-xl p-3 shadow-soft text-center">
            <p className="text-lg font-bold text-pending">{clientData.unpaidTasks}</p>
            <p className="text-2xs text-muted-foreground">Unpaid</p>
          </div>
        </div>

        {clientData.pendingAmount > 0 && (
          <div className="mt-3 bg-pending-soft rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-pending" />
              <span className="text-sm font-medium">Pending payments</span>
            </div>
            <span className="font-bold text-pending">{formatCurrency(clientData.pendingAmount)}</span>
          </div>
        )}
      </header>

      {/* Income Trend Chart */}
      {hasChartData && (
        <section className="px-5 mt-4">
          <div className="bg-card rounded-2xl p-4 shadow-soft">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-income" />
              Income Trend (Last 6 Months)
            </h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={incomeChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`colorIncome-${id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColorMap[clientData.client.color]} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={chartColorMap[clientData.client.color]} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="label" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(value) => value > 0 ? `${value}` : ''}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Income']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke={chartColorMap[clientData.client.color]}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill={`url(#colorIncome-${id})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      )}

      {/* Tasks Section */}
      <section className="px-5 mt-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Tasks ({filteredAndSortedTodos.length}/{clientData.todos.length})
          </h2>
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
          {/* Filter Pills */}
          <div className="flex gap-1.5 flex-shrink-0">
            {([
              { key: 'all', label: 'All' },
              { key: 'pending', label: 'Pending' },
              { key: 'completed', label: 'Done' },
              { key: 'unpaid', label: 'Unpaid' },
            ] as const).map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                  filter === f.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 mb-3">
          <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortType)}
            className="text-xs bg-card border border-border rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="date-desc">Newest first</option>
            <option value="date-asc">Oldest first</option>
            <option value="amount-desc">Highest amount</option>
            <option value="amount-asc">Lowest amount</option>
          </select>
        </div>
        
        <div className="space-y-2">
          {filteredAndSortedTodos.length > 0 ? (
            filteredAndSortedTodos.map(todo => (
              <div
                key={todo.id}
                className="bg-card rounded-xl p-3 shadow-soft flex items-center gap-3 group"
              >
                <button
                  onClick={() => todos.toggleTodo(todo.id)}
                  className="flex-shrink-0"
                >
                  {todo.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-income" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium truncate",
                    todo.completed && "line-through text-muted-foreground"
                  )}>
                    {todo.title}
                  </p>
                  <div className="flex items-center gap-2 text-2xs text-muted-foreground">
                    <span>{formatDate(todo.dueDate)}</span>
                    {todo.amount && (
                      <span className="text-income">{formatCurrency(todo.amount)}</span>
                    )}
                    {todo.paymentStatus === 'unpaid' && todo.completed && (
                      <span className="text-pending">Unpaid</span>
                    )}
                    {todo.paymentStatus === 'paid' && (
                      <span className="text-income">Paid</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity">
                  <button
                    onClick={() => navigate(`/tasks/${todo.id}/edit`)}
                    className="w-8 h-8 rounded-lg bg-muted/80 hover:bg-muted flex items-center justify-center"
                  >
                    <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(todo.id)}
                    className="w-8 h-8 rounded-lg bg-expense-soft hover:bg-expense/20 flex items-center justify-center"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-expense" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-card rounded-xl p-4 text-center shadow-soft">
              <p className="text-sm text-muted-foreground">
                {filter === 'all' ? 'No tasks yet' : `No ${filter} tasks`}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Income History Section */}
      <section className="px-5 mt-6 pb-6">
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-income" />
          Income History ({clientData.income.length})
        </h2>
        
        <div className="space-y-2">
          {clientData.income.length > 0 ? (
            clientData.income.map(entry => (
              <div
                key={entry.id}
                className="bg-card rounded-xl p-3 shadow-soft flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-income-soft flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-income" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{entry.description}</p>
                  <div className="flex items-center gap-2 text-2xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(entry.date)}</span>
                  </div>
                </div>

                <span className="font-semibold text-income">
                  +{formatCurrency(entry.amount)}
                </span>
              </div>
            ))
          ) : (
            <div className="bg-card rounded-xl p-4 text-center shadow-soft">
              <p className="text-sm text-muted-foreground">No income recorded yet</p>
            </div>
          )}
        </div>
      </section>

      <DeleteConfirmDialog
        open={!!deleteTaskId}
        onOpenChange={(open) => !open && setDeleteTaskId(null)}
        onConfirm={confirmDeleteTask}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
      />
    </MobileLayout>
  );
}
