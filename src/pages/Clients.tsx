import { MobileLayout } from '@/components/layout/MobileLayout';
import { mockClients, mockTodos, mockMoneyEntries } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { ChevronRight, CheckCircle2, Clock, TrendingUp } from 'lucide-react';

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
  const clientStats = mockClients.map(client => {
    const todos = mockTodos.filter(t => t.clientId === client.id);
    const completed = todos.filter(t => t.completed).length;
    const unpaid = todos.filter(t => t.paymentStatus === 'unpaid' && t.completed).length;
    
    const income = mockMoneyEntries
      .filter(m => {
        const linkedTodo = mockTodos.find(t => t.id === m.linkedTodoId);
        return linkedTodo?.clientId === client.id && m.type === 'income';
      })
      .reduce((sum, m) => sum + m.amount, 0);

    return {
      ...client,
      totalTasks: todos.length,
      completed,
      unpaid,
      income,
    };
  });

  return (
    <MobileLayout>
      <header className="px-5 pt-6 pb-4 safe-top">
        <h1 className="text-2xl font-bold">Clients</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {mockClients.length} active clients
        </p>
      </header>

      <section className="px-5 pb-6 space-y-3">
        {clientStats.map(client => (
          <div
            key={client.id}
            className="bg-card rounded-2xl p-4 shadow-soft active:scale-[0.98] transition-transform"
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
                      ${client.income}
                    </span>
                  )}
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        ))}
      </section>
    </MobileLayout>
  );
}
