import { cn } from '@/lib/utils';
import { Todo, Client } from '@/types';
import { ClientBadge } from '@/components/ui/ClientBadge';
import { PaymentStatusBadge } from '@/components/ui/PaymentStatusBadge';
import { Check } from 'lucide-react';

interface TodoCardProps {
  todo: Todo;
  client: Client;
  onToggle?: (id: string) => void;
}

export function TodoCard({ todo, client, onToggle }: TodoCardProps) {
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
      </div>
    </div>
  );
}
