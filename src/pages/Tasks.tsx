import { MobileLayout } from '@/components/layout/MobileLayout';
import { TodoCard, TodoCardDesktop } from '@/components/todos/TodoCard';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TaskCalendarView } from '@/components/tasks/TaskCalendarView';
import { useData } from '@/contexts/DataContext';
import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Search, X, AlertTriangle, ArrowUpDown, Calendar, DollarSign, Users, CalendarDays, ChevronLeft, ChevronRight, List, LayoutGrid } from 'lucide-react';
import { format, parseISO, isSameDay, addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Filter = 'all' | 'pending' | 'completed' | 'overdue' | 'date' | 'dateRange';
type DateRangePreset = 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | null;
type SortOption = 'newest' | 'dueDate' | 'amount' | 'client';
type ViewMode = 'list' | 'calendar';

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
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>(null);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | null>(null);
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<Date | null>(new Date());

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
    setDateRange(null);
    setDateRangePreset(null);
    setFilter('all');
    setSearchParams({});
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setDateFilter(date);
      setDateRange(null);
      setDateRangePreset(null);
      setFilter('date');
      setSearchParams({ date: format(date, 'yyyy-MM-dd') });
    }
  };

  const handlePresetSelect = (preset: DateRangePreset) => {
    if (!preset) return;
    
    const today = new Date();
    let start: Date;
    let end: Date;
    
    switch (preset) {
      case 'thisWeek':
        start = startOfWeek(today, { weekStartsOn: 1 });
        end = endOfWeek(today, { weekStartsOn: 1 });
        break;
      case 'lastWeek':
        start = startOfWeek(subDays(today, 7), { weekStartsOn: 1 });
        end = endOfWeek(subDays(today, 7), { weekStartsOn: 1 });
        break;
      case 'thisMonth':
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
      case 'lastMonth':
        const lastMonth = subDays(startOfMonth(today), 1);
        start = startOfMonth(lastMonth);
        end = endOfMonth(lastMonth);
        break;
      default:
        return;
    }
    
    setDateRange({ start, end });
    setDateRangePreset(preset);
    setDateFilter(null);
    setFilter('dateRange');
    setSearchParams({ range: preset });
  };

  const getPresetLabel = (preset: DateRangePreset): string => {
    switch (preset) {
      case 'thisWeek': return 'This Week';
      case 'lastWeek': return 'Last Week';
      case 'thisMonth': return 'This Month';
      case 'lastMonth': return 'Last Month';
      default: return '';
    }
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
    } else if (filter === 'dateRange' && dateRange) {
      result = result.filter(t => {
        if (!t.dueDate) return false;
        return isWithinInterval(new Date(t.dueDate), { start: dateRange.start, end: dateRange.end });
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
  }, [todos.todos, clients.clients, searchQuery, filter, sortBy, dateFilter, dateRange]);

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
      {(dateFilter || dateRange) && (
        <div className="px-5 mb-3">
          <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-xl">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {dateFilter 
                  ? `Showing tasks for ${format(dateFilter, 'EEEE, MMM d')}`
                  : dateRangePreset 
                    ? `Showing ${getPresetLabel(dateRangePreset)} (${format(dateRange!.start, 'MMM d')} - ${format(dateRange!.end, 'MMM d')})`
                    : 'Filtered by date'
                }
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

      {/* Filters, Sort & View Toggle */}
      <div className="px-5 mb-4">
        <div className="flex gap-2">
          {/* View Toggle */}
          <div className="flex p-1 bg-muted rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                viewMode === 'list'
                  ? "bg-card shadow-soft text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                viewMode === 'calendar'
                  ? "bg-card shadow-soft text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Calendar view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

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

          {/* Date Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                  dateFilter
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <CalendarDays className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {dateFilter 
                    ? format(dateFilter, 'MMM d') 
                    : dateRangePreset 
                      ? getPresetLabel(dateRangePreset)
                      : 'Date'
                  }
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="p-2 border-b border-border space-y-2">
                {/* Quick actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDateSelect(new Date())}
                    className={cn(
                      "flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                      dateFilter && isSameDay(dateFilter, new Date())
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary/10 text-primary hover:bg-primary/20"
                    )}
                  >
                    Today
                  </button>
                  {(dateFilter || dateRange) && (
                    <button
                      onClick={() => clearDateFilter()}
                      className="px-3 py-1.5 text-xs font-medium bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
                
                {/* Date Range Presets */}
                <div className="grid grid-cols-2 gap-1.5">
                  {(['thisWeek', 'lastWeek', 'thisMonth', 'lastMonth'] as DateRangePreset[]).map((preset) => (
                    <button
                      key={preset}
                      onClick={() => handlePresetSelect(preset)}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                        dateRangePreset === preset
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {getPresetLabel(preset)}
                    </button>
                  ))}
                </div>
                
                {/* Week navigation */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-border">
                  <button
                    onClick={() => handleDateSelect(subDays(dateFilter || new Date(), 7))}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                  >
                    <ChevronLeft className="w-3 h-3" />
                    <span>Prev week</span>
                  </button>
                  <span className="text-xs text-muted-foreground">
                    {dateFilter ? format(dateFilter, 'MMM d') : 'Select date'}
                  </span>
                  <button
                    onClick={() => handleDateSelect(addDays(dateFilter || new Date(), 7))}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                  >
                    <span>Next week</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <CalendarComponent
                mode="single"
                selected={dateFilter || undefined}
                onSelect={handleDateSelect}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          
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

      {/* Tasks Content */}
      <section className="px-5 pb-6">
        {viewMode === 'calendar' ? (
          <TaskCalendarView
            todos={filteredAndSortedTodos}
            clients={clients.clients}
            selectedDate={calendarSelectedDate}
            onDateSelect={setCalendarSelectedDate}
            onTaskToggle={todos.toggleTodo}
            onTaskEdit={handleEdit}
            onTaskReschedule={(taskId, newDate) => {
              const task = todos.todos.find(t => t.id === taskId);
              if (task) {
                todos.updateTodo(taskId, { ...task, dueDate: newDate });
              }
            }}
          />
        ) : (
          <div className="space-y-3">
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
