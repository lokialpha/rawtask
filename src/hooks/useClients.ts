import { useLocalStorage } from './useLocalStorage';
import { Client } from '@/types';
import { mockClients } from '@/data/mockData';

const STORAGE_KEY = 'rawtask_clients';

export function useClients() {
  const [clients, setClients] = useLocalStorage<Client[]>(STORAGE_KEY, mockClients);

  const addClient = (client: Omit<Client, 'id'>) => {
    const newClient: Client = {
      ...client,
      id: crypto.randomUUID(),
    };
    setClients(prev => [...prev, newClient]);
    return newClient;
  };

  const updateClient = (id: string, updates: Partial<Omit<Client, 'id'>>) => {
    setClients(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  const getClient = (id: string) => clients.find(c => c.id === id);

  return {
    clients,
    addClient,
    updateClient,
    deleteClient,
    getClient,
  };
}
