import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
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
  addDays,
  subDays,
  addWeeks,
  subWeeks
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Todo } from '@/types';

interface MiniCalendarProps {
  todos: Todo[];
  onDateClick?: (date: Date) => void;
}

export function MiniCalendar({ todos, onDateClick }: MiniCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [focusedDate, setFocusedDate] = useState<Date>(new Date());
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Calculate task density for each day
  const taskDensity = useMemo(() => {
    const density: Record<string, number> = {};
    todos.forEach(todo => {
      const dateKey = todo.dueDate;
      density[dateKey] = (density[dateKey] || 0) + 1;
    });
    return density;
  }, [todos]);

  const maxTasks = useMemo(() => 
    Math.max(...Object.values(taskDensity), 1),
    [taskDensity]
  );

  const getDensityLevel = (count: number): 'none' | 'low' | 'medium' | 'high' => {
    if (count === 0) return 'none';
    const ratio = count / maxTasks;
    if (ratio <= 0.33) return 'low';
    if (ratio <= 0.66) return 'medium';
    return 'high';
  };

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Navigate to focused date's month if it changes
  useEffect(() => {
    if (!isSameMonth(focusedDate, currentMonth)) {
      setCurrentMonth(startOfMonth(focusedDate));
    }
  }, [focusedDate, currentMonth]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    let newDate = focusedDate;
    let handled = true;

    switch (e.key) {
      case 'ArrowLeft':
        newDate = subDays(focusedDate, 1);
        break;
      case 'ArrowRight':
        newDate = addDays(focusedDate, 1);
        break;
      case 'ArrowUp':
        newDate = subWeeks(focusedDate, 1);
        break;
      case 'ArrowDown':
        newDate = addWeeks(focusedDate, 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onDateClick?.(focusedDate);
        return;
      case 'Home':
        newDate = startOfWeek(focusedDate, { weekStartsOn: 0 });
        break;
      case 'End':
        newDate = endOfWeek(focusedDate, { weekStartsOn: 0 });
        break;
      case 'PageUp':
        newDate = subMonths(focusedDate, 1);
        break;
      case 'PageDown':
        newDate = addMonths(focusedDate, 1);
        break;
      default:
        handled = false;
    }

    if (handled) {
      e.preventDefault();
      setFocusedDate(newDate);
    }
  }, [focusedDate, onDateClick]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "bg-card rounded-2xl p-4 shadow-soft outline-none transition-shadow",
        isFocused && "ring-2 ring-primary/50"
      )}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      role="grid"
      aria-label="Task calendar. Use arrow keys to navigate dates, Enter to select."
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            tabIndex={-1}
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            tabIndex={-1}
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Keyboard hint */}
      {isFocused && (
        <div className="text-[10px] text-muted-foreground text-center mb-2 bg-muted/50 rounded-lg py-1 px-2">
          ←→↑↓ navigate • Enter select • PgUp/PgDn months
        </div>
      )}

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1" role="row">
        {weekDays.map((day, i) => (
          <div 
            key={i} 
            className="text-center text-[10px] font-medium text-muted-foreground py-1"
            role="columnheader"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1" role="rowgroup">
        {days.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const taskCount = taskDensity[dateKey] || 0;
          const densityLevel = getDensityLevel(taskCount);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isTodayDate = isToday(day);
          const isFocusedDate = isSameDay(day, focusedDate);

          return (
            <button
              key={dateKey}
              onClick={() => {
                setFocusedDate(day);
                onDateClick?.(day);
              }}
              tabIndex={-1}
              role="gridcell"
              aria-selected={isFocusedDate}
              aria-label={`${format(day, 'MMMM d, yyyy')}${taskCount > 0 ? `, ${taskCount} tasks` : ''}`}
              className={cn(
                "relative aspect-square flex items-center justify-center rounded-lg text-xs transition-all",
                !isCurrentMonth && "text-muted-foreground/40",
                isCurrentMonth && "text-foreground",
                isTodayDate && "ring-2 ring-primary ring-offset-1 ring-offset-background font-bold",
                isFocusedDate && isFocused && "ring-2 ring-accent ring-offset-1 ring-offset-background",
                "hover:bg-muted/50"
              )}
            >
              <span className="relative z-10">{format(day, 'd')}</span>
              
              {/* Density indicator */}
              {taskCount > 0 && isCurrentMonth && (
                <div 
                  className={cn(
                    "absolute inset-1 rounded-md -z-0 transition-colors",
                    densityLevel === 'low' && "bg-primary/20",
                    densityLevel === 'medium' && "bg-primary/40",
                    densityLevel === 'high' && "bg-primary/60"
                  )}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 mt-3 pt-3 border-t border-border">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded bg-primary/20" />
          <span className="text-[10px] text-muted-foreground">Few</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded bg-primary/40" />
          <span className="text-[10px] text-muted-foreground">Some</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded bg-primary/60" />
          <span className="text-[10px] text-muted-foreground">Busy</span>
        </div>
      </div>
    </div>
  );
}