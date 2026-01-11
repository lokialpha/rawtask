import { MobileLayout } from '@/components/layout/MobileLayout';
import { useSettings, CURRENCIES, Currency } from '@/hooks/useSettings';
import { useDataBackup } from '@/hooks/useDataBackup';
import { Settings as SettingsIcon, DollarSign, Target, Check, BarChart3, ChevronRight, Sun, Moon, Monitor, Download, Upload, Database } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';

export default function Settings() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { settings, updateCurrency, updateMonthlyGoal, formatCurrency } = useSettings();
  const { exportData, importData, getStats } = useDataBackup();
  const [goalInput, setGoalInput] = useState(settings.monthlyGoal.toString());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stats = getStats();

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importData(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

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

      {/* Theme Selection */}
      <section className="px-5 mt-2">
        <div className="bg-card rounded-2xl p-5 shadow-soft">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
              <Sun className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div>
              <h2 className="font-semibold">Appearance</h2>
              <p className="text-xs text-muted-foreground">Choose your preferred theme</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map((option) => {
              const isSelected = theme === option.value;
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    setTheme(option.value);
                    toast.success(`Theme changed to ${option.label}`);
                  }}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isSelected ? "text-primary" : "text-muted-foreground")} />
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Monthly Goal */}
      <section className="px-5 mt-4">
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

      {/* Data Backup */}
      <section className="px-5 mt-4">
        <div className="bg-card rounded-2xl p-5 shadow-soft">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
              <Database className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div>
              <h2 className="font-semibold">Data Backup</h2>
              <p className="text-xs text-muted-foreground">Export or import your data</p>
            </div>
          </div>

          <div className="bg-muted/50 rounded-xl p-3 mb-4">
            <p className="text-xs text-muted-foreground mb-2">Current data:</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-bold">{stats.clientsCount}</p>
                <p className="text-2xs text-muted-foreground">Clients</p>
              </div>
              <div>
                <p className="text-lg font-bold">{stats.todosCount}</p>
                <p className="text-2xs text-muted-foreground">Tasks</p>
              </div>
              <div>
                <p className="text-lg font-bold">{stats.moneyEntriesCount}</p>
                <p className="text-2xs text-muted-foreground">Entries</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={exportData}
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4" />
              Import
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileImport}
            className="hidden"
          />
          <p className="text-2xs text-muted-foreground mt-3 text-center">
            Import will replace all existing data
          </p>
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
