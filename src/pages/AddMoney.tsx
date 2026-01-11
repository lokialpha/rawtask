import { MobileLayout } from '@/components/layout/MobileLayout';
import { incomeCategories, expenseCategories } from '@/data/mockData';
import { ArrowLeft, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type MoneyType = 'income' | 'expense';

export default function AddMoney() {
  const navigate = useNavigate();
  const [type, setType] = useState<MoneyType>('income');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const categories = type === 'income' ? incomeCategories : expenseCategories;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save to state/database
    navigate('/money');
  };

  return (
    <MobileLayout showFab={false}>
      <header className="px-5 pt-6 pb-4 safe-top flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Add Money</h1>
      </header>

      <form onSubmit={handleSubmit} className="px-5 pb-6 space-y-5">
        {/* Type Toggle */}
        <div className="flex gap-2 p-1 bg-muted rounded-xl">
          <button
            type="button"
            onClick={() => {
              setType('income');
              setCategory('');
            }}
            className={cn(
              "flex-1 py-3 rounded-lg font-medium transition-all duration-200",
              type === 'income'
                ? "gradient-income shadow-income text-income-foreground"
                : "text-muted-foreground"
            )}
          >
            Income
          </button>
          <button
            type="button"
            onClick={() => {
              setType('expense');
              setCategory('');
            }}
            className={cn(
              "flex-1 py-3 rounded-lg font-medium transition-all duration-200",
              type === 'expense'
                ? "gradient-expense shadow-expense text-expense-foreground"
                : "text-muted-foreground"
            )}
          >
            Expense
          </button>
        </div>

        {/* Amount */}
        <div>
          <label className="text-sm font-medium mb-2 block">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-muted-foreground">
              $
            </span>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className={cn(
                "w-full h-16 pl-10 pr-4 text-2xl font-bold bg-card rounded-xl border-2 outline-none transition-all",
                type === 'income'
                  ? "border-income/30 focus:border-income text-income"
                  : "border-expense/30 focus:border-expense text-expense"
              )}
              required
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="text-sm font-medium mb-2 block">Category</label>
          <div className="grid grid-cols-3 gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  "py-3 px-2 rounded-xl text-sm font-medium border-2 transition-all",
                  category === cat
                    ? type === 'income'
                      ? "border-income bg-income-soft text-income"
                      : "border-expense bg-expense-soft text-expense"
                    : "border-border bg-card text-muted-foreground"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Description <span className="text-muted-foreground">(optional)</span>
          </label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What's this for?"
            className="w-full h-12 px-4 bg-card rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>

        {/* Date */}
        <div>
          <label className="text-sm font-medium mb-2 block">Date</label>
          <div className="relative">
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full h-12 px-4 bg-card rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className={cn(
            "w-full h-14 rounded-2xl font-semibold active:scale-[0.98] transition-transform mt-6",
            type === 'income'
              ? "gradient-income shadow-income text-income-foreground"
              : "gradient-expense shadow-expense text-expense-foreground"
          )}
        >
          Add {type === 'income' ? 'Income' : 'Expense'}
        </button>
      </form>
    </MobileLayout>
  );
}
