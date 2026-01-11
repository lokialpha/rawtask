import { MobileLayout } from '@/components/layout/MobileLayout';
import { TodoCard, TodoCardDesktop } from '@/components/todos/TodoCard';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { useData } from '@/contexts/DataContext';
import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Search, X, AlertTriangle, ArrowUpDown, Calendar, DollarSign, Users } from 'lucide-react';
import { format, parseISO, isSameDay } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Filter = 'all' | 'pending' | 'completed' | 'overdue' | 'date';
type SortOption = 'newest' | 'dueDate' | 'amount' | 'client';

const sortLabels: Record<SortOption, string> = {
  newest: 'Newest',
  dueDate: 'Due Date',
  amount: 'Amount',
  client: 'Client',
};

export default function Tasks() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { todos, clients } = useData();
  const [filter, setFilter] = useState<Filter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | null>(null);

  // Read date filter from URL on mount
  useEffect(() => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      try {
        const parsedDate = parseISO(dateParam);
        setDateFilter(parsedDate);
        setFilter('date');
      } catch {
        // Invalid date, ignore
      }
    }
  }, [searchParams]);

  const clearDateFilter = () => {
    setDateFilter(null);
    setFilter('all');
    setSearchParams({});
  };

  const overdueCount = useMemo(() => {
    const now = new Date();
    return todos.todos.filter(todo => {
      if (!todo.completed || todo.paymentStatus !== 'unpaid' || !todo.dueDate) return false;
      return new Date(todo.dueDate) < now;
    }).length;
  }, [todos.todos]);

  const getClient = (clientId: string) =>
    clients.clients.find(c => c.id === clientId);

  const filteredAndSortedTodos = useMemo(() => {
    let result = [...todos.todos];
    const now = new Date();

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(todo => {
        const client = getClient(todo.clientId);
        return (
          todo.title.toLowerCase().includes(query) ||
          client?.name.toLowerCase().includes(query)
        );
      });
    }

    // Apply status/date filter
    if (filter === 'pending') {
      result = result.filter(t => !t.completed);
    } else if (filter === 'completed') {
      result = result.filter(t => t.completed);
    } else if (filter === 'overdue') {
      result = result.filter(t => {
        if (!t.completed || t.paymentStatus !== 'unpaid' || !t.dueDate) return false;
        return new Date(t.dueDate) < now;
      });
    } else if (filter === 'date' && dateFilter) {
      result = result.filter(t => {
        if (!t.dueDate) return false;
        return isSameDay(new Date(t.dueDate), dateFilter);
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'amount':
          return (b.amount || 0) - (a.amount || 0);
        case 'client':
          const clientA = getClient(a.clientId)?.name || '';
          const clientB = getClient(b.clientId)?.name || '';
          return clientA.localeCompare(clientB);
        case 'newest':
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });

    return result;
  }, [todos.todos, clients.clients, searchQuery, filter, sortBy, dateFilter]);

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

  const filters: { key: Filter; label: string; count?: number }[] = [
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

      {/* Date Filter Banner */}
      {dateFilter && (
        <div className="px-5 mb-3">
          <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-xl">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Showing tasks for {format(dateFilter, 'EEEE, MMM d')}
              </span>
            </div>
            <button
              onClick={clearDateFilter}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          </div>
        </div>
      )}

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

      {/* Filters & Sort */}
      <div className="px-5 mb-4">
        <div className="flex gap-2">
          <div className="flex gap-2 p-1 bg-muted rounded-xl flex-1">
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
          
          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                  sortBy !== 'newest'
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <ArrowUpDown className="w-4 h-4" />
                <span className="hidden sm:inline">{sortLabels[sortBy]}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setSortBy('newest')} className="gap-2">
                <ArrowUpDown className="w-4 h-4" />
                Newest
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('dueDate')} className="gap-2">
                <Calendar className="w-4 h-4" />
                Due Date
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('amount')} className="gap-2">
                <DollarSign className="w-4 h-4" />
                Amount
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('client')} className="gap-2">
                <Users className="w-4 h-4" />
                Client
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {overdueCount > 0 && (
            <button
              onClick={() => setFilter(filter === 'overdue' ? 'all' : 'overdue')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                filter === 'overdue'
                  ? "bg-expense text-white shadow-md"
                  : "bg-expense-soft text-expense hover:bg-expense/20 animate-pulse-subtle"
              )}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{overdueCount}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tasks List */}
      <section className="px-5 pb-6 space-y-3">
        {searchQuery && (
          <p className="text-xs text-muted-foreground">
            {filteredAndSortedTodos.length} result{filteredAndSortedTodos.length !== 1 ? 's' : ''} for "{searchQuery}"
          </p>
        )}
        {filteredAndSortedTodos.length > 0 ? (
          filteredAndSortedTodos.map(todo => (
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
