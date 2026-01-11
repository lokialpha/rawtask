import { useMemo, useState, useCallback, useEffect } from 'react';
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  format, 
  isSameMonth, 
  isToday, 
  isSameDay,
  startOfWeek, 
  endOfWeek,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  isBefore,
  startOfDay
} from 'date-fns';
import { ChevronLeft, ChevronRight, Check, Clock, DollarSign, GripVertical, Calendar, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Todo, Client } from '@/types';
import { toast } from 'sonner';

type CalendarMode = 'month' | 'week';

interface TaskCalendarViewProps {
  todos: Todo[];
  clients: Client[];
  onDateSelect: (date: Date) => void;
  onTaskToggle: (id: string) => void;
  onTaskEdit: (id: string) => void;
  onTaskReschedule: (taskId: string, newDate: string) => void;
  selectedDate: Date | null;
}

export function TaskCalendarView({ 
  todos, 
  clients, 
  onDateSelect, 
  onTaskToggle, 
  onTaskEdit,
  onTaskReschedule,
  selectedDate 
}: TaskCalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('month');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute for the time indicator
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Calculate the position of the current time indicator (percentage of day passed)
  const timeIndicatorPosition = useMemo(() => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    return ((hours * 60 + minutes) / (24 * 60)) * 100;
  }, [currentTime]);

  // Helper to check if a task is in the past (for today's tasks)
  const isTaskPast = useCallback((task: Todo) => {
    const taskDate = new Date(task.dueDate);
    const today = startOfDay(new Date());
    return isBefore(taskDate, today);
  }, []);
  
  // Calculate days based on mode
  const days = useMemo(() => {
    if (calendarMode === 'week') {
      const weekStart = startOfWeek(currentMonth, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(currentMonth, { weekStartsOn: 0 });
      return eachDayOfInterval({ start: weekStart, end: weekEnd });
    } else {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
      const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
      return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    }
  }, [currentMonth, calendarMode]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Todo[]> = {};
    todos.forEach(todo => {
      const dateKey = todo.dueDate;
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(todo);
    });
    return grouped;
  }, [todos]);

  const getClient = useCallback((clientId: string) => 
    clients.find(c => c.id === clientId),
    [clients]
  );

  // Get tasks for selected date
  const selectedDateTasks = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return tasksByDate[dateKey] || [];
  }, [selectedDate, tasksByDate]);

  const handlePrev = () => {
    if (calendarMode === 'week') {
      setCurrentMonth(subWeeks(currentMonth, 1));
    } else {
      setCurrentMonth(subMonths(currentMonth, 1));
    }
  };

  const handleNext = () => {
    if (calendarMode === 'week') {
      setCurrentMonth(addWeeks(currentMonth, 1));
    } else {
      setCurrentMonth(addMonths(currentMonth, 1));
    }
  };

  const getHeaderTitle = () => {
    if (calendarMode === 'week') {
      const weekStart = startOfWeek(currentMonth, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(currentMonth, { weekStartsOn: 0 });
      if (isSameMonth(weekStart, weekEnd)) {
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'd, yyyy')}`;
      }
      return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
    }
    return format(currentMonth, 'MMMM yyyy');
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverDate(null);
  };

  const handleDragOver = (e: React.DragEvent, dateKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverDate(dateKey);
  };

  const handleDragLeave = () => {
    setDragOverDate(null);
  };

  const handleDrop = (e: React.DragEvent, dateKey: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    
    if (taskId && draggedTaskId) {
      const task = todos.find(t => t.id === taskId);
      if (task && task.dueDate !== dateKey) {
        onTaskReschedule(taskId, dateKey);
        toast.success(`Task moved to ${format(new Date(dateKey), 'MMM d')}`);
      }
    }
    
    setDraggedTaskId(null);
    setDragOverDate(null);
  };

  return (
    <div className="space-y-4">
      {/* Calendar Grid */}
      <div className="bg-card rounded-2xl p-4 shadow-soft">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            {getHeaderTitle()}
          </h3>
          <div className="flex items-center gap-2">
            {/* Mode Toggle */}
            <div className="flex p-0.5 bg-muted rounded-lg">
              <button
                onClick={() => setCalendarMode('week')}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all",
                  calendarMode === 'week'
                    ? "bg-card shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Week</span>
              </button>
              <button
                onClick={() => setCalendarMode('month')}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all",
                  calendarMode === 'month'
                    ? "bg-card shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Month</span>
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-muted-foreground" />
              </button>
              <button
                onClick={() => {
                  setCurrentMonth(new Date());
                  onDateSelect(new Date());
                }}
                className="px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
              >
                Today
              </button>
              <button
                onClick={handleNext}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div 
              key={day} 
              className="text-center text-xs font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayTasks = tasksByDate[dateKey] || [];
            const completedCount = dayTasks.filter(t => t.completed).length;
            const pendingCount = dayTasks.length - completedCount;
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isTodayDate = isToday(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isDragOver = dragOverDate === dateKey;
            const showDay = calendarMode === 'week' || isCurrentMonth;

            return (
              <button
                key={dateKey}
                onClick={() => onDateSelect(day)}
                onDragOver={(e) => handleDragOver(e, dateKey)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, dateKey)}
                className={cn(
                  "relative p-1 rounded-lg transition-all flex flex-col",
                  calendarMode === 'week' 
                    ? "min-h-[100px] sm:min-h-[120px]" 
                    : "min-h-[60px] sm:min-h-[80px]",
                  !showDay && "opacity-40",
                  showDay && "hover:bg-muted/50",
                  isTodayDate && "ring-2 ring-primary ring-inset",
                  isSelected && "bg-primary/10",
                  isDragOver && "bg-primary/20 ring-2 ring-primary ring-dashed"
                )}
              >
                {/* Day header for week view */}
                {calendarMode === 'week' && (
                  <span className="text-[10px] text-muted-foreground font-medium mb-0.5">
                    {format(day, 'EEE')}
                  </span>
                )}
                <span className={cn(
                  "text-xs font-medium",
                  calendarMode === 'week' && "text-sm mb-1",
                  isTodayDate && "text-primary font-bold",
                  isSelected && "text-primary"
                )}>
                  {calendarMode === 'week' ? format(day, 'MMM d') : format(day, 'd')}
                </span>
                
                {/* Time indicator line for today in week view */}
                {calendarMode === 'week' && isTodayDate && (
                  <div 
                    className="absolute left-0 right-0 z-10 pointer-events-none"
                    style={{ top: `${Math.max(25, Math.min(95, 25 + (timeIndicatorPosition * 0.7)))}%` }}
                  >
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-destructive" />
                      <div className="flex-1 h-0.5 bg-destructive" />
                    </div>
                  </div>
                )}

                {/* Task indicators or task list in week view */}
                {dayTasks.length > 0 && showDay && (
                  calendarMode === 'week' ? (
                    <div className="flex-1 overflow-hidden space-y-0.5 mt-1">
                      {dayTasks.slice(0, 3).map(task => {
                        const isPastDay = isBefore(startOfDay(day), startOfDay(new Date()));
                        const isPastTask = isPastDay && !task.completed;
                        return (
                          <div
                            key={task.id}
                            className={cn(
                              "text-[10px] px-1 py-0.5 rounded truncate transition-opacity",
                              task.completed 
                                ? "bg-income/20 text-income line-through opacity-60" 
                                : isPastTask
                                  ? "bg-destructive/20 text-destructive"
                                  : "bg-todo/20 text-todo"
                            )}
                            title={task.title}
                          >
                            {task.title}
                          </div>
                        );
                      })}
                      {dayTasks.length > 3 && (
                        <div className="text-[10px] text-muted-foreground text-center">
                          +{dayTasks.length - 3} more
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-0.5 mt-auto">
                      {pendingCount > 0 && (
                        <div className="flex items-center gap-0.5 px-1 py-0.5 bg-todo/20 text-todo rounded text-[10px] font-medium">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{pendingCount}</span>
                        </div>
                      )}
                      {completedCount > 0 && (
                        <div className="flex items-center gap-0.5 px-1 py-0.5 bg-income/20 text-income rounded text-[10px] font-medium">
                          <Check className="w-2.5 h-2.5" />
                          <span>{completedCount}</span>
                        </div>
                      )}
                    </div>
                  )
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Tasks */}
      {selectedDate && (
        <div className="bg-card rounded-2xl p-4 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold">
              {format(selectedDate, 'EEEE, MMMM d')}
              <span className="text-muted-foreground font-normal ml-2">
                ({selectedDateTasks.length} task{selectedDateTasks.length !== 1 ? 's' : ''})
              </span>
            </h4>
            {selectedDateTasks.length > 0 && (
              <span className="text-xs text-muted-foreground">
                Drag tasks to reschedule
              </span>
            )}
          </div>
          
          {selectedDateTasks.length > 0 ? (
            <div className="space-y-2">
              {selectedDateTasks.map(task => {
                const client = getClient(task.clientId);
                const isDragging = draggedTaskId === task.id;
                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl transition-all cursor-grab active:cursor-grabbing",
                      task.completed ? "bg-muted/50" : "bg-muted",
                      isDragging && "opacity-50 ring-2 ring-primary"
                    )}
                  >
                    <div className="text-muted-foreground flex-shrink-0">
                      <GripVertical className="w-4 h-4" />
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskToggle(task.id);
                      }}
                      className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
                        task.completed
                          ? "bg-income border-income"
                          : "border-muted-foreground hover:border-primary"
                      )}
                    >
                      {task.completed && <Check className="w-3 h-3 text-white" />}
                    </button>
                    
                    <button
                      onClick={() => onTaskEdit(task.id)}
                      className="flex-1 text-left"
                    >
                      <p className={cn(
                        "text-sm font-medium",
                        task.completed && "line-through text-muted-foreground"
                      )}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {client && (
                          <span 
                            className="text-xs px-1.5 py-0.5 rounded-full"
                            style={{ 
                              backgroundColor: `${client.color}20`,
                              color: client.color 
                            }}
                          >
                            {client.name}
                          </span>
                        )}
                        {task.amount && task.amount > 0 && (
                          <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                            <DollarSign className="w-3 h-3" />
                            {task.amount}
                          </span>
                        )}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No tasks for this date
            </p>
          )}
        </div>
      )}
    </div>
  );
}
