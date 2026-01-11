import { useLocalStorage } from './useLocalStorage';

export type Currency = {
  code: string;
  symbol: string;
  name: string;
};

export const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
];

export type Settings = {
  currency: Currency;
  monthlyGoal: number;
};

const DEFAULT_SETTINGS: Settings = {
  currency: CURRENCIES[0],
  monthlyGoal: 5000,
};

export function useSettings() {
  const [settings, setSettings] = useLocalStorage<Settings>('rafiki-settings', DEFAULT_SETTINGS);

  const updateCurrency = (currency: Currency) => {
    setSettings(prev => ({ ...prev, currency }));
  };

  const updateMonthlyGoal = (monthlyGoal: number) => {
    setSettings(prev => ({ ...prev, monthlyGoal }));
  };

  const formatCurrency = (amount: number) => {
    return `${settings.currency.symbol}${amount.toLocaleString()}`;
  };

  return {
    settings,
    updateCurrency,
    updateMonthlyGoal,
    formatCurrency,
  };
}
