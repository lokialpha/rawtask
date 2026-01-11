import React, { createContext, useContext, ReactNode } from 'react';
import { useClients } from '@/hooks/useClients';
import { useTodos } from '@/hooks/useTodos';
import { useMoneyEntries } from '@/hooks/useMoneyEntries';

type DataContextType = {
  clients: ReturnType<typeof useClients>;
  todos: ReturnType<typeof useTodos>;
  money: ReturnType<typeof useMoneyEntries>;
};

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const clients = useClients();
  const todos = useTodos();
  const money = useMoneyEntries();

  return (
    <DataContext.Provider value={{ clients, todos, money }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
