import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Zap } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';
import { PaymentStatus } from '@/types';
import { cn } from '@/lib/utils';

interface QuickAddTaskProps {
  defaultDate?: string;
}

export function QuickAddTask({ defaultDate }: QuickAddTaskProps) {
  const { todos, clients } = useData();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('no-payment');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = defaultDate || new Date().toISOString().split('T')[0];

  const resetForm = () => {
    setTitle('');
    setClientId('');
    setPaymentStatus('no-payment');
    setAmount('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Please enter a task title');
      return;
    }
    
    if (!clientId) {
      toast.error('Please select a client');
      return;
    }

    setIsSubmitting(true);

    try {
      todos.addTodo({
        title: title.trim(),
        clientId,
        completed: false,
        dueDate: today,
        paymentStatus,
        amount: paymentStatus !== 'no-payment' ? parseFloat(amount) || 0 : undefined,
      });

      toast.success('Task added!');
      resetForm();
      setOpen(false);
    } catch (error) {
      toast.error('Failed to add task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const clientColors: Record<string, string> = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
    teal: 'bg-teal-500',
    orange: 'bg-orange-500',
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          className="gap-1.5 rounded-full px-4 shadow-md"
        >
          <Zap className="w-4 h-4" />
          Quick Add
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md mx-4 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <Plus className="w-4 h-4 text-primary-foreground" />
            </div>
            Quick Add Task
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Client</Label>
            <div className="grid grid-cols-2 gap-2">
              {clients.clients.slice(0, 6).map((client) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => setClientId(client.id)}
                  className={cn(
                    "flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all text-left",
                    clientId === client.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className={cn("w-3 h-3 rounded-full", clientColors[client.color])} />
                  <span className="text-sm font-medium truncate">{client.name}</span>
                </button>
              ))}
            </div>
            {clients.clients.length > 6 && (
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="More clients..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", clientColors[client.color])} />
                        {client.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label>Payment Status</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'no-payment', label: 'No Payment' },
                { value: 'unpaid', label: 'Unpaid' },
                { value: 'paid', label: 'Paid' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPaymentStatus(option.value as PaymentStatus)}
                  className={cn(
                    "py-2 px-3 rounded-xl border-2 text-xs font-medium transition-all",
                    paymentStatus === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {paymentStatus !== 'no-payment' && (
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isSubmitting || !title.trim() || !clientId}
            >
              Add Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}