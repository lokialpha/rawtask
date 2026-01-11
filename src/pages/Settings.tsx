import { MobileLayout } from '@/components/layout/MobileLayout';
import { useSettings, CURRENCIES, Currency } from '@/hooks/useSettings';
import { Settings as SettingsIcon, DollarSign, Target, Check, BarChart3, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const navigate = useNavigate();
  const { settings, updateCurrency, updateMonthlyGoal, formatCurrency } = useSettings();
  const [goalInput, setGoalInput] = useState(settings.monthlyGoal.toString());

  const handleCurrencySelect = (currency: Currency) => {
    updateCurrency(currency);
    toast.success(`Currency changed to ${currency.name}`);
  };

  const handleGoalChange = (value: string) => {
    setGoalInput(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      updateMonthlyGoal(numValue);
    }
  };

  const handleGoalBlur = () => {
    const numValue = parseFloat(goalInput);
    if (isNaN(numValue) || numValue < 0) {
      setGoalInput(settings.monthlyGoal.toString());
      toast.error('Please enter a valid amount');
    } else {
      toast.success('Monthly goal updated');
    }
  };

  return (
    <MobileLayout showFab={false}>
      <header className="px-5 pt-6 pb-4 safe-top">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-primary">
            <SettingsIcon className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-sm text-muted-foreground">Customize your experience</p>
          </div>
        </div>
      </header>

      {/* Monthly Goal */}
      <section className="px-5 mt-2">
        <div className="bg-card rounded-2xl p-5 shadow-soft">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-income-soft rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-income" />
            </div>
            <div>
              <h2 className="font-semibold">Monthly Income Goal</h2>
              <p className="text-xs text-muted-foreground">Set your target earnings</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal">Goal Amount ({settings.currency.symbol})</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {settings.currency.symbol}
              </span>
              <Input
                id="goal"
                type="number"
                value={goalInput}
                onChange={(e) => handleGoalChange(e.target.value)}
                onBlur={handleGoalBlur}
                className="pl-8"
                min="0"
                step="100"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Current goal: {formatCurrency(settings.monthlyGoal)}
            </p>
          </div>
        </div>
      </section>

      {/* Currency Selection */}
      <section className="px-5 mt-4">
        <div className="bg-card rounded-2xl p-5 shadow-soft">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Currency</h2>
              <p className="text-xs text-muted-foreground">Select your preferred currency</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {CURRENCIES.map((currency) => {
              const isSelected = settings.currency.code === currency.code;
              return (
                <button
                  key={currency.code}
                  onClick={() => handleCurrencySelect(currency)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border-2 transition-all",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">{currency.symbol}</span>
                    <span className="text-sm">{currency.code}</span>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="px-5 mt-4 pb-6">
        <div className="bg-card rounded-2xl shadow-soft overflow-hidden">
          <button
            onClick={() => navigate('/stats')}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="text-left">
                <p className="font-semibold">View Stats</p>
                <p className="text-xs text-muted-foreground">See your financial overview</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </section>
    </MobileLayout>
  );
}
