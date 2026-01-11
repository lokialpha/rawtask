import { MobileLayout } from '@/components/layout/MobileLayout';
import { SummaryCard } from '@/components/ui/SummaryCard';
import { TodoCard, TodoCardDesktop } from '@/components/todos/TodoCard';
import { MoneyEntryCard } from '@/components/money/MoneyEntryCard';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { useData } from '@/contexts/DataContext';
import { TrendingUp, TrendingDown, Clock, Wallet } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Index() {
  const navigate = useNavigate();
  const { todos, money, clients } = useData();
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [deleteMoneyId, setDeleteMoneyId] = useState<string | null>(null);
  
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const todayStr = today.toISOString().split('T')[0];

  const todayTodos = useMemo(() => 
    todos.todos.filter(t => t.dueDate === todayStr),
    [todos.todos, todayStr]
  );

  const todayMoney = useMemo(() =>
    money.entries.filter(m => m.date === todayStr),
    [money.entries, todayStr]
  );

  const summary = useMemo(() => {
    const income = todayMoney
      .filter(m => m.type === 'income')
      .reduce((sum, m) => sum + m.amount, 0);
    
    const expense = todayMoney
      .filter(m => m.type === 'expense')
      .reduce((sum, m) => sum + m.amount, 0);
    
    const unpaidTasks = todos.todos.filter(
      t => t.paymentStatus === 'unpaid' && t.completed
    );
    const pendingAmount = unpaidTasks.reduce((sum, t) => sum + (t.amount || 0), 0);

    return { income, expense, pendingCount: unpaidTasks.length, pendingAmount };
  }, [todayMoney, todos.todos]);

  const getClient = (clientId: string) =>
    clients.clients.find(c => c.id === clientId)!;

  const handleEditTask = (id: string) => {
    navigate(`/tasks/${id}/edit`);
  };

  const handleDeleteTask = (id: string) => {
    setDeleteTaskId(id);
  };

  const confirmDeleteTask = () => {
    if (deleteTaskId) {
      todos.deleteTodo(deleteTaskId);
      toast.success('Task deleted');
      setDeleteTaskId(null);
    }
  };

  const handleEditMoney = (id: string) => {
    navigate(`/money/${id}/edit`);
  };

  const handleDeleteMoney = (id: string) => {
    setDeleteMoneyId(id);
  };

  const confirmDeleteMoney = () => {
    if (deleteMoneyId) {
      money.deleteEntry(deleteMoneyId);
      toast.success('Entry deleted');
      setDeleteMoneyId(null);
    }
  };

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
            subtitle={`${summary.pendingCount} task${summary.pendingCount > 1 ? 's' : ''} waiting → Tap to view`}
            icon={Clock}
            variant="pending"
            className="w-full"
            onClick={() => navigate('/tasks/unpaid')}
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
              <div key={todo.id}>
                {/* Mobile - swipeable */}
                <div className="sm:hidden">
                  <TodoCard
                    todo={todo}
                    client={getClient(todo.clientId)}
                    onToggle={todos.toggleTodo}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                  />
                </div>
                {/* Desktop - action buttons */}
                <div className="hidden sm:block">
                  <TodoCardDesktop
                    todo={todo}
                    client={getClient(todo.clientId)}
                    onToggle={todos.toggleTodo}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                  />
                </div>
              </div>
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
              <MoneyEntryCard
                key={entry.id}
                entry={entry}
                onEdit={handleEditMoney}
                onDelete={handleDeleteMoney}
              />
            ))
          ) : (
            <div className="bg-card rounded-2xl p-6 text-center shadow-soft">
              <p className="text-muted-foreground text-sm">No entries today</p>
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

      <DeleteConfirmDialog
        open={!!deleteMoneyId}
        onOpenChange={(open) => !open && setDeleteMoneyId(null)}
        onConfirm={confirmDeleteMoney}
        title="Delete Entry"
        description="Are you sure you want to delete this entry? This action cannot be undone."
      />
    </MobileLayout>
  );
}
