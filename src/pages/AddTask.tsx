import { MobileLayout } from '@/components/layout/MobileLayout';
import { mockClients } from '@/data/mockData';
import { ArrowLeft, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { PaymentStatus } from '@/types';

export default function AddTask() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('no-payment');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save to state/database
    navigate('/tasks');
  };

  const paymentOptions: { key: PaymentStatus; label: string }[] = [
    { key: 'no-payment', label: 'No payment' },
    { key: 'unpaid', label: 'Unpaid' },
    { key: 'paid', label: 'Paid' },
  ];

  return (
    <MobileLayout showFab={false}>
      <header className="px-5 pt-6 pb-4 safe-top flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">New Task</h1>
      </header>

      <form onSubmit={handleSubmit} className="px-5 pb-6 space-y-5">
        {/* Title */}
        <div>
          <label className="text-sm font-medium mb-2 block">Task Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full h-12 px-4 bg-card rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            required
          />
        </div>

        {/* Client */}
        <div>
          <label className="text-sm font-medium mb-2 block">Client</label>
          <select
            value={clientId}
            onChange={e => setClientId(e.target.value)}
            className="w-full h-12 px-4 bg-card rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
            required
          >
            <option value="">Select a client</option>
            {mockClients.map(client => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        {/* Due Date */}
        <div>
          <label className="text-sm font-medium mb-2 block">Due Date</label>
          <div className="relative">
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full h-12 px-4 bg-card rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Payment Status */}
        <div>
          <label className="text-sm font-medium mb-2 block">Payment</label>
          <div className="flex gap-2">
            {paymentOptions.map(option => (
              <button
                key={option.key}
                type="button"
                onClick={() => setPaymentStatus(option.key)}
                className={cn(
                  "flex-1 py-3 rounded-xl text-sm font-medium border-2 transition-all",
                  paymentStatus === option.key
                    ? option.key === 'paid'
                      ? "border-income bg-income-soft text-income"
                      : option.key === 'unpaid'
                      ? "border-pending bg-pending-soft text-pending"
                      : "border-primary bg-accent text-primary"
                    : "border-border bg-card text-muted-foreground"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Amount (if payment linked) */}
        {paymentStatus !== 'no-payment' && (
          <div className="animate-slide-down">
            <label className="text-sm font-medium mb-2 block">Amount ($)</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full h-12 px-4 bg-card rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="w-full h-14 gradient-primary rounded-2xl text-primary-foreground font-semibold shadow-primary active:scale-[0.98] transition-transform mt-6"
        >
          Create Task
        </button>
      </form>
    </MobileLayout>
  );
}
