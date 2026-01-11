import { cn } from '@/lib/utils';
import { PaymentStatus } from '@/types';
import { Check, Clock, Minus } from 'lucide-react';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  amount?: number;
}

const statusConfig = {
  paid: {
    label: 'Paid',
    icon: Check,
    className: 'bg-income-soft text-income border-income/30',
  },
  unpaid: {
    label: 'Unpaid',
    icon: Clock,
    className: 'bg-pending-soft text-pending border-pending/30',
  },
  'no-payment': {
    label: 'No payment',
    icon: Minus,
    className: 'bg-muted text-muted-foreground border-border',
  },
};

export function PaymentStatusBadge({ status, amount }: PaymentStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-2xs font-medium border",
        config.className
      )}
    >
      <Icon className="w-3 h-3" />
      {status !== 'no-payment' && amount ? `$${amount}` : config.label}
    </span>
  );
}
