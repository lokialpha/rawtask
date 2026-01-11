import { MobileLayout } from '@/components/layout/MobileLayout';
import { useData } from '@/contexts/DataContext';
import { useSettings } from '@/hooks/useSettings';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { cn } from '@/lib/utils';
import { ArrowLeft, CheckCircle2, Circle, Clock, TrendingUp, TrendingDown, Pencil, Trash2, Calendar } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';

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

export default function ClientDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { clients, todos, money } = useData();
  const { formatCurrency } = useSettings();
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  const client = clients.getClient(id || '');

  const clientData = useMemo(() => {
    if (!client) return null;

    const clientTodos = todos.todos
      .filter(t => t.clientId === client.id)
      .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

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

      {/* Tasks Section */}
      <section className="px-5 mt-2">
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Tasks ({clientData.todos.length})
        </h2>
        
        <div className="space-y-2">
          {clientData.todos.length > 0 ? (
            clientData.todos.map(todo => (
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
              <p className="text-sm text-muted-foreground">No tasks yet</p>
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
