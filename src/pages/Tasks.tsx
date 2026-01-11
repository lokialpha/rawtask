import { MobileLayout } from '@/components/layout/MobileLayout';
import { TodoCard, TodoCardDesktop } from '@/components/todos/TodoCard';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { useData } from '@/contexts/DataContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Filter = 'all' | 'pending' | 'completed';

export default function Tasks() {
  const navigate = useNavigate();
  const { todos, clients } = useData();
  const [filter, setFilter] = useState<Filter>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredTodos = todos.todos.filter(todo => {
    if (filter === 'pending') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const getClient = (clientId: string) =>
    clients.clients.find(c => c.id === clientId)!;

  const handleEdit = (id: string) => {
    navigate(`/tasks/${id}/edit`);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      todos.deleteTodo(deleteId);
      toast.success('Task deleted');
      setDeleteId(null);
    }
  };

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
        <p className="text-xs text-muted-foreground mt-1 sm:hidden">
          Swipe left on a task to edit or delete
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
            <div key={todo.id}>
              {/* Mobile - swipeable */}
              <div className="sm:hidden">
                <TodoCard
                  todo={todo}
                  client={getClient(todo.clientId)}
                  onToggle={todos.toggleTodo}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
              {/* Desktop - action buttons */}
              <div className="hidden sm:block">
                <TodoCardDesktop
                  todo={todo}
                  client={getClient(todo.clientId)}
                  onToggle={todos.toggleTodo}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="bg-card rounded-2xl p-8 text-center shadow-soft">
            <p className="text-muted-foreground">No tasks found</p>
          </div>
        )}
      </section>

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
      />
    </MobileLayout>
  );
}
