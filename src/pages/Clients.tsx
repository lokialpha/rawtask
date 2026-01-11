import { MobileLayout } from '@/components/layout/MobileLayout';
import { useData } from '@/contexts/DataContext';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { cn } from '@/lib/utils';
import { ChevronRight, CheckCircle2, Clock, TrendingUp, Plus, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';
import { useSettings } from '@/hooks/useSettings';
const dotColorMap = {
  blue: 'bg-client-blue',
  purple: 'bg-client-purple',
  pink: 'bg-client-pink',
  teal: 'bg-client-teal',
  orange: 'bg-client-orange',
};

const bgColorMap = {
  blue: 'bg-client-blue/10',
  purple: 'bg-client-purple/10',
  pink: 'bg-client-pink/10',
  teal: 'bg-client-teal/10',
  orange: 'bg-client-orange/10',
};

export default function Clients() {
  const navigate = useNavigate();
  const { clients, todos, money } = useData();
  const { formatCurrency } = useSettings();
  const [deleteClientId, setDeleteClientId] = useState<string | null>(null);

  const clientStats = clients.clients.map(client => {
    const clientTodos = todos.todos.filter(t => t.clientId === client.id);
    const completed = clientTodos.filter(t => t.completed).length;
    const unpaid = clientTodos.filter(t => t.paymentStatus === 'unpaid' && t.completed).length;
    
    const income = money.entries
      .filter(m => {
        const linkedTodo = todos.todos.find(t => t.id === m.linkedTodoId);
        return linkedTodo?.clientId === client.id && m.type === 'income';
      })
      .reduce((sum, m) => sum + m.amount, 0);

    return {
      ...client,
      totalTasks: clientTodos.length,
      completed,
      unpaid,
      income,
    };
  });

  const handleDelete = (id: string) => {
    // Check if client has tasks
    const clientTodos = todos.todos.filter(t => t.clientId === id);
    if (clientTodos.length > 0) {
      toast.error('Cannot delete client with existing tasks');
      return;
    }
    setDeleteClientId(id);
  };

  const confirmDelete = () => {
    if (deleteClientId) {
      clients.deleteClient(deleteClientId);
      toast.success('Client deleted');
      setDeleteClientId(null);
    }
  };

  return (
    <MobileLayout showFab={false}>
      <header className="px-5 pt-6 pb-4 safe-top">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Clients</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {clients.clients.length} active clients
            </p>
          </div>
          <button
            onClick={() => navigate('/clients/new')}
            className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-primary active:scale-95 transition-transform"
          >
            <Plus className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>
      </header>

      <section className="px-5 pb-6 space-y-3">
        {clientStats.map(client => (
          <div
            key={client.id}
            className="bg-card rounded-2xl p-4 shadow-soft group"
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  bgColorMap[client.color]
                )}
              >
                <span
                  className={cn(
                    "text-lg font-bold",
                    `text-client-${client.color}`
                  )}
                  style={{ color: `hsl(var(--client-${client.color}))` }}
                >
                  {client.name.charAt(0)}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate">{client.name}</h3>
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      dotColorMap[client.color]
                    )}
                  />
                </div>
                
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {client.completed}/{client.totalTasks}
                  </span>
                  {client.unpaid > 0 && (
                    <span className="flex items-center gap-1 text-pending">
                      <Clock className="w-3 h-3" />
                      {client.unpaid} unpaid
                    </span>
                  )}
                  {client.income > 0 && (
                    <span className="flex items-center gap-1 text-income">
                      <TrendingUp className="w-3 h-3" />
                      {formatCurrency(client.income)}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity sm:opacity-100">
                <button
                  onClick={() => navigate(`/clients/${client.id}/edit`)}
                  className="w-9 h-9 rounded-xl bg-muted/80 hover:bg-muted flex items-center justify-center transition-colors"
                >
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => handleDelete(client.id)}
                  className="w-9 h-9 rounded-xl bg-expense-soft hover:bg-expense/20 flex items-center justify-center transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-expense" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>

      <DeleteConfirmDialog
        open={!!deleteClientId}
        onOpenChange={(open) => !open && setDeleteClientId(null)}
        onConfirm={confirmDelete}
        title="Delete Client"
        description="Are you sure you want to delete this client? This action cannot be undone."
      />
    </MobileLayout>
  );
}
