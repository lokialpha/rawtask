import { useLocalStorage } from './useLocalStorage';
import { MoneyEntry } from '@/types';
import { mockMoneyEntries } from '@/data/mockData';

const STORAGE_KEY = 'rawtask_money';

export function useMoneyEntries() {
  const [entries, setEntries] = useLocalStorage<MoneyEntry[]>(STORAGE_KEY, mockMoneyEntries);

  const addEntry = (entry: Omit<MoneyEntry, 'id' | 'createdAt'>) => {
    const newEntry: MoneyEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setEntries(prev => [...prev, newEntry]);
    return newEntry;
  };

  const updateEntry = (id: string, updates: Partial<Omit<MoneyEntry, 'id' | 'createdAt'>>) => {
    setEntries(prev =>
      prev.map(e => (e.id === id ? { ...e, ...updates } : e))
    );
  };

  const deleteEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const getEntry = (id: string) => entries.find(e => e.id === id);

  const getTodayEntries = () => {
    const today = new Date().toISOString().split('T')[0];
    return entries.filter(e => e.date === today);
  };

  const getTodaySummary = () => {
    const todayEntries = getTodayEntries();
    return {
      income: todayEntries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0),
      expense: todayEntries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0),
    };
  };

  const getMonthlyEntries = (year: number, month: number) => {
    return entries.filter(e => {
      const date = new Date(e.date);
      return date.getFullYear() === year && date.getMonth() === month;
    });
  };

  return {
    entries,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntry,
    getTodayEntries,
    getTodaySummary,
    getMonthlyEntries,
  };
}
