import { MobileLayout } from '@/components/layout/MobileLayout';
import { SummaryCard } from '@/components/ui/SummaryCard';
import { TodoCard } from '@/components/todos/TodoCard';
import { MoneyEntryCard } from '@/components/money/MoneyEntryCard';
import { mockTodos, mockMoneyEntries, mockClients } from '@/data/mockData';
import { TrendingUp, TrendingDown, Clock, Wallet } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function Index() {
  const [todos, setTodos] = useState(mockTodos);
  
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const todayStr = today.toISOString().split('T')[0];

  const todayTodos = useMemo(() => 
    todos.filter(t => t.dueDate === todayStr),
    [todos, todayStr]
  );

  const todayMoney = useMemo(() =>
    mockMoneyEntries.filter(m => m.date === todayStr),
    [todayStr]
  );

  const summary = useMemo(() => {
    const income = todayMoney
      .filter(m => m.type === 'income')
      .reduce((sum, m) => sum + m.amount, 0);
    
    const expense = todayMoney
      .filter(m => m.type === 'expense')
      .reduce((sum, m) => sum + m.amount, 0);
    
    const unpaidTasks = todos.filter(
      t => t.paymentStatus === 'unpaid' && t.completed
    );
    const pendingAmount = unpaidTasks.reduce((sum, t) => sum + (t.amount || 0), 0);

    return { income, expense, pendingCount: unpaidTasks.length, pendingAmount };
  }, [todayMoney, todos]);

  const toggleTodo = (id: string) => {
    setTodos(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const getClient = (clientId: string) =>
    mockClients.find(c => c.id === clientId)!;

  return (
    <MobileLayout>
      {/* Header */}
      <header className="px-5 pt-6 pb-4 safe-top">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-sm text-muted-foreground">Today</p>
            <h1 className="text-xl font-bold text-foreground">{formattedDate}</h1>
          </div>
          <div className="w-10 h-10 gradient-hero rounded-xl flex items-center justify-center shadow-primary">
            <span className="text-lg font-bold text-primary-foreground">R</span>
          </div>
        </div>
      </header>

      {/* Summary Cards */}
      <section className="px-5 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <SummaryCard
            title="Today's Income"
            value={`$${summary.income}`}
            icon={TrendingUp}
            variant="income"
          />
          <SummaryCard
            title="Today's Expenses"
            value={`$${summary.expense}`}
            icon={TrendingDown}
            variant="expense"
          />
        </div>
        
        {summary.pendingCount > 0 && (
          <SummaryCard
            title="Pending Payments"
            value={`$${summary.pendingAmount}`}
            subtitle={`${summary.pendingCount} task${summary.pendingCount > 1 ? 's' : ''} waiting`}
            icon={Clock}
            variant="pending"
            className="w-full"
          />
        )}
      </section>

      {/* Today's Tasks */}
      <section className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">Today's Tasks</h2>
          <span className="text-xs text-muted-foreground">
            {todayTodos.filter(t => t.completed).length}/{todayTodos.length} done
          </span>
        </div>
        
        <div className="space-y-3">
          {todayTodos.length > 0 ? (
            todayTodos.map(todo => (
              <TodoCard
                key={todo.id}
                todo={todo}
                client={getClient(todo.clientId)}
                onToggle={toggleTodo}
              />
            ))
          ) : (
            <div className="bg-card rounded-2xl p-6 text-center shadow-soft">
              <p className="text-muted-foreground text-sm">No tasks for today</p>
              <p className="text-xs text-muted-foreground mt-1">
                Tap + to add a new task
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Recent Money */}
      <section className="px-5 mt-6 pb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">Today's Money</h2>
          <Wallet className="w-4 h-4 text-muted-foreground" />
        </div>
        
        <div className="space-y-3">
          {todayMoney.length > 0 ? (
            todayMoney.map(entry => (
              <MoneyEntryCard key={entry.id} entry={entry} />
            ))
          ) : (
            <div className="bg-card rounded-2xl p-6 text-center shadow-soft">
              <p className="text-muted-foreground text-sm">No entries today</p>
            </div>
          )}
        </div>
      </section>
    </MobileLayout>
  );
}
