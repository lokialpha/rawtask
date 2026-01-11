import { cn } from '@/lib/utils';
import { Todo, Client } from '@/types';
import { ClientBadge } from '@/components/ui/ClientBadge';
import { PaymentStatusBadge } from '@/components/ui/PaymentStatusBadge';
import { SwipeableCard } from '@/components/ui/SwipeableCard';
import { Check, Pencil, Trash2 } from 'lucide-react';

interface TodoCardProps {
  todo: Todo;
  client: Client;
  onToggle?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export function TodoCard({ todo, client, onToggle, onEdit, onDelete, showActions = true }: TodoCardProps) {
  const cardContent = (
    <div
      className={cn(
        "bg-card rounded-2xl p-4 shadow-soft transition-all duration-200",
        todo.completed && "opacity-70"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle?.(todo.id);
          }}
          className={cn(
            "flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 mt-0.5",
            todo.completed
              ? "bg-income border-income"
              : "border-border hover:border-primary"
          )}
        >
          {todo.completed && (
            <Check className="w-4 h-4 text-income-foreground" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <p
            className={cn(
              "text-sm font-medium leading-tight",
              todo.completed && "line-through text-muted-foreground"
            )}
          >
            {todo.title}
          </p>
          
          <div className="flex items-center gap-2 flex-wrap">
            <ClientBadge client={client} />
            <PaymentStatusBadge status={todo.paymentStatus} amount={todo.amount} />
          </div>
        </div>

        {/* Desktop action buttons */}
        {showActions && (
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(todo.id);
              }}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Pencil className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(todo.id);
              }}
              className="p-2 rounded-lg hover:bg-expense-soft transition-colors"
            >
              <Trash2 className="w-4 h-4 text-expense" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (!showActions) {
    return cardContent;
  }

  return (
    <div className="sm:hidden">
      <SwipeableCard
        onEdit={() => onEdit?.(todo.id)}
        onDelete={() => onDelete?.(todo.id)}
      >
        {cardContent}
      </SwipeableCard>
    </div>
  );
}

// Also export a non-swipeable version for desktop
export function TodoCardDesktop({ todo, client, onToggle, onEdit, onDelete }: TodoCardProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-2xl p-4 shadow-soft transition-all duration-200 active:scale-[0.98]",
        todo.completed && "opacity-70"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggle?.(todo.id)}
          className={cn(
            "flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 mt-0.5",
            todo.completed
              ? "bg-income border-income"
              : "border-border hover:border-primary"
          )}
        >
          {todo.completed && (
            <Check className="w-4 h-4 text-income-foreground" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <p
            className={cn(
              "text-sm font-medium leading-tight",
              todo.completed && "line-through text-muted-foreground"
            )}
          >
            {todo.title}
          </p>
          
          <div className="flex items-center gap-2 flex-wrap">
            <ClientBadge client={client} />
            <PaymentStatusBadge status={todo.paymentStatus} amount={todo.amount} />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit?.(todo.id)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Pencil className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => onDelete?.(todo.id)}
            className="p-2 rounded-lg hover:bg-expense-soft transition-colors"
          >
            <Trash2 className="w-4 h-4 text-expense" />
          </button>
        </div>
      </div>
    </div>
  );
}
