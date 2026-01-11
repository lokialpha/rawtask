import { cn } from '@/lib/utils';
import { Client } from '@/types';

interface ClientBadgeProps {
  client: Client;
  size?: 'sm' | 'md';
}

const colorMap = {
  blue: 'bg-client-blue/15 text-client-blue border-client-blue/30',
  purple: 'bg-client-purple/15 text-client-purple border-client-purple/30',
  pink: 'bg-client-pink/15 text-client-pink border-client-pink/30',
  teal: 'bg-client-teal/15 text-client-teal border-client-teal/30',
  orange: 'bg-client-orange/15 text-client-orange border-client-orange/30',
};

const dotColorMap = {
  blue: 'bg-client-blue',
  purple: 'bg-client-purple',
  pink: 'bg-client-pink',
  teal: 'bg-client-teal',
  orange: 'bg-client-orange',
};

export function ClientBadge({ client, size = 'sm' }: ClientBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        colorMap[client.color],
        size === 'sm' ? 'px-2 py-0.5 text-2xs' : 'px-3 py-1 text-xs'
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", dotColorMap[client.color])} />
      {client.name}
    </span>
  );
}
