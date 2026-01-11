import { MobileLayout } from '@/components/layout/MobileLayout';
import { TodoCard, TodoCardDesktop } from '@/components/todos/TodoCard';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { useData } from '@/contexts/DataContext';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Search, X } from 'lucide-react';

type Filter = 'all' | 'pending' | 'completed';

export default function Tasks() {
  const navigate = useNavigate();
  const { todos, clients } = useData();
  const [filter, setFilter] = useState<Filter>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTodos = useMemo(() => {
    let result = todos.todos;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(todo => {
        const client = clients.clients.find(c => c.id === todo.clientId);
        return (
          todo.title.toLowerCase().includes(query) ||
          client?.name.toLowerCase().includes(query)
        );
      });
    }

    // Apply status filter
    if (filter === 'pending') {
      result = result.filter(t => !t.completed);
    } else if (filter === 'completed') {
      result = result.filter(t => t.completed);
    }

    return result;
  }, [todos.todos, clients.clients, searchQuery, filter]);

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

      {/* Search Bar */}
      <div className="px-5 mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks or clients..."
            className="w-full h-11 pl-10 pr-10 bg-card rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

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
        {searchQuery && (
          <p className="text-xs text-muted-foreground">
            {filteredTodos.length} result{filteredTodos.length !== 1 ? 's' : ''} for "{searchQuery}"
          </p>
        )}
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
            <p className="text-muted-foreground">
              {searchQuery ? `No tasks matching "${searchQuery}"` : 'No tasks found'}
            </p>
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
