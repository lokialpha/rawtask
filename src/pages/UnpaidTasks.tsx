import { MobileLayout } from '@/components/layout/MobileLayout';
import { useData } from '@/contexts/DataContext';
import { ClientBadge } from '@/components/ui/ClientBadge';
import { cn } from '@/lib/utils';
import { ArrowLeft, Clock, DollarSign, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function UnpaidTasks() {
  const navigate = useNavigate();
  const { todos, clients, money } = useData();

  const unpaidTasks = todos.getUnpaidCompletedTodos().map(todo => {
    const client = clients.getClient(todo.clientId);
    const completedDate = new Date(todo.createdAt);
    const today = new Date();
    const diffTime = today.getTime() - completedDate.getTime();
    const daysOverdue = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      ...todo,
      client,
      daysOverdue,
    };
  }).sort((a, b) => b.daysOverdue - a.daysOverdue);

  const totalUnpaid = unpaidTasks.reduce((sum, t) => sum + (t.amount || 0), 0);

  const handleMarkAsPaid = (todoId: string, amount?: number) => {
    // Update the todo status to paid
    todos.updateTodo(todoId, { paymentStatus: 'paid' });
    
    // Create a corresponding income entry
    if (amount) {
      const todo = todos.getTodo(todoId);
      const client = todo ? clients.getClient(todo.clientId) : null;
      money.addEntry({
        type: 'income',
        amount,
        category: 'Development',
        date: new Date().toISOString().split('T')[0],
        description: `${todo?.title}${client ? ` - ${client.name}` : ''}`,
        linkedTodoId: todoId,
      });
    }
    
    toast.success('Marked as paid!');
  };

  const getOverdueColor = (days: number) => {
    if (days >= 30) return 'text-expense';
    if (days >= 14) return 'text-pending';
    return 'text-muted-foreground';
  };

  const getOverdueLabel = (days: number) => {
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  return (
    <MobileLayout showFab={false}>
      <header className="px-5 pt-6 pb-4 safe-top flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold">Unpaid Tasks</h1>
          <p className="text-sm text-muted-foreground">
            {unpaidTasks.length} task{unpaidTasks.length !== 1 ? 's' : ''} awaiting payment
          </p>
        </div>
      </header>

      {/* Summary Card */}
      {unpaidTasks.length > 0 && (
        <section className="px-5 mb-4">
          <div className="bg-pending-soft border-2 border-pending/30 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-pending font-medium">Total Unpaid</p>
                <p className="text-2xl font-bold text-pending">${totalUnpaid}</p>
              </div>
              <div className="w-12 h-12 bg-pending/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-pending" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Task List */}
      <section className="px-5 pb-6 space-y-3">
        {unpaidTasks.length > 0 ? (
          unpaidTasks.map(task => (
            <div
              key={task.id}
              className="bg-card rounded-2xl p-4 shadow-soft"
            >
              <div className="flex items-start gap-3">
                {/* Completed icon */}
                <div className="w-8 h-8 rounded-lg bg-income-soft flex items-center justify-center mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-income" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
                  <p className="text-sm font-medium leading-tight">{task.title}</p>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    {task.client && <ClientBadge client={task.client} />}
                    
                    {/* Days overdue */}
                    <div className={cn(
                      "flex items-center gap-1 text-xs",
                      getOverdueColor(task.daysOverdue)
                    )}>
                      {task.daysOverdue >= 14 && (
                        <AlertTriangle className="w-3 h-3" />
                      )}
                      {task.daysOverdue < 14 && (
                        <Clock className="w-3 h-3" />
                      )}
                      <span>{getOverdueLabel(task.daysOverdue)}</span>
                    </div>
                  </div>

                  {/* Amount and action */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-lg font-bold text-pending">
                      ${task.amount || 0}
                    </span>
                    <button
                      onClick={() => handleMarkAsPaid(task.id, task.amount)}
                      className="px-4 py-2 bg-income text-income-foreground rounded-xl text-sm font-medium active:scale-95 transition-transform"
                    >
                      Mark Paid
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-card rounded-2xl p-8 text-center shadow-soft">
            <div className="w-16 h-16 mx-auto mb-4 bg-income-soft rounded-2xl flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-income" />
            </div>
            <h3 className="font-semibold text-lg mb-1">All caught up!</h3>
            <p className="text-sm text-muted-foreground">
              No unpaid tasks waiting for payment
            </p>
          </div>
        )}
      </section>
    </MobileLayout>
  );
}
