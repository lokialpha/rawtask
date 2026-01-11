import { Plus, X, CheckSquare, Wallet } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleAddTodo = () => {
    setIsOpen(false);
    navigate('/tasks/new');
  };

  const handleAddMoney = () => {
    setIsOpen(false);
    navigate('/money/new');
  };

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-3">
      {/* Sub-buttons */}
      <div
        className={cn(
          "flex flex-col gap-3 transition-all duration-300",
          isOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        <button
          onClick={handleAddTodo}
          className="flex items-center gap-3 px-4 py-3 bg-card rounded-2xl shadow-elevated animate-scale-in"
        >
          <span className="text-sm font-medium text-foreground">Add Task</span>
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-primary">
            <CheckSquare className="w-5 h-5 text-primary-foreground" />
          </div>
        </button>
        
        <button
          onClick={handleAddMoney}
          className="flex items-center gap-3 px-4 py-3 bg-card rounded-2xl shadow-elevated animate-scale-in"
          style={{ animationDelay: '50ms' }}
        >
          <span className="text-sm font-medium text-foreground">Add Money</span>
          <div className="w-10 h-10 gradient-income rounded-xl flex items-center justify-center shadow-income">
            <Wallet className="w-5 h-5 text-income-foreground" />
          </div>
        </button>
      </div>

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-fab",
          isOpen
            ? "bg-muted rotate-45"
            : "gradient-primary animate-pulse-glow"
        )}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-foreground" />
        ) : (
          <Plus className="w-7 h-7 text-primary-foreground" />
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/60 backdrop-blur-sm -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
