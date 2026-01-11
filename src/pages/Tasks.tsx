import { MobileLayout } from '@/components/layout/MobileLayout';
import { TodoCard } from '@/components/todos/TodoCard';
import { useData } from '@/contexts/DataContext';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type Filter = 'all' | 'pending' | 'completed';

export default function Tasks() {
  const { todos, clients } = useData();
  const [filter, setFilter] = useState<Filter>('all');

  const filteredTodos = todos.todos.filter(todo => {
    if (filter === 'pending') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const getClient = (clientId: string) =>
    clients.clients.find(c => c.id === clientId)!;

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'completed', label: 'Done' },
  ];

  return (
    <MobileLayout>
      <header className="px-5 pt-6 pb-4 safe-top">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {todos.todos.filter(t => !t.completed).length} tasks pending
        </p>
      </header>

      {/* Filters */}
      <div className="px-5 mb-4">
        <div className="flex gap-2 p-1 bg-muted rounded-xl">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                filter === f.key
                  ? "bg-card shadow-soft text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <section className="px-5 pb-6 space-y-3">
        {filteredTodos.length > 0 ? (
          filteredTodos.map(todo => (
            <TodoCard
              key={todo.id}
              todo={todo}
              client={getClient(todo.clientId)}
              onToggle={todos.toggleTodo}
            />
          ))
        ) : (
          <div className="bg-card rounded-2xl p-8 text-center shadow-soft">
            <p className="text-muted-foreground">No tasks found</p>
          </div>
        )}
      </section>
    </MobileLayout>
  );
}
