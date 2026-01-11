import { Home, CheckSquare, Wallet, Users, Settings } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useData } from '@/contexts/DataContext';
import { useMemo } from 'react';

const navItems = [
  { icon: Home, label: 'Today', path: '/' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
  { icon: Wallet, label: 'Money', path: '/money' },
  { icon: Users, label: 'Clients', path: '/clients' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { todos } = useData();

  const hasOverdueTasks = useMemo(() => {
    const now = new Date();
    return todos.todos.some(todo => {
      if (!todo.completed || todo.paymentStatus === 'paid' || todo.paymentStatus === 'no-payment') {
        return false;
      }
      if (!todo.dueDate) return false;
      const dueDate = new Date(todo.dueDate);
      return dueDate < now;
    });
  }, [todos.todos]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          const showNotificationDot = item.path === '/tasks' && hasOverdueTasks;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 relative",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div
                className={cn(
                  "p-1.5 rounded-xl transition-all duration-200 relative",
                  isActive && "gradient-primary shadow-primary"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-all",
                    isActive && "text-primary-foreground"
                  )}
                />
                {showNotificationDot && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-expense rounded-full border-2 border-card animate-pulse-subtle" />
                )}
              </div>
              <span
                className={cn(
                  "text-2xs font-medium transition-all",
                  isActive && "font-semibold"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
