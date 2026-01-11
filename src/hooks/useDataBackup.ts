import { useData } from '@/contexts/DataContext';
import { useSettings } from './useSettings';
import { toast } from 'sonner';
import { useRef } from 'react';

type BackupData = {
  version: string;
  exportedAt: string;
  clients: any[];
  todos: any[];
  moneyEntries: any[];
  settings: any;
};

export function useDataBackup() {
  const { clients, todos, money } = useData();
  const { settings } = useSettings();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const exportData = () => {
    const backup: BackupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      clients: clients.clients,
      todos: todos.todos,
      moneyEntries: money.entries,
      settings,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rafiki-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Data exported successfully!');
  };

  const importData = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const backup: BackupData = JSON.parse(content);

          // Validate backup structure
          if (!backup.version || !backup.clients || !backup.todos || !backup.moneyEntries) {
            throw new Error('Invalid backup file format');
          }

          // Import data to localStorage
          localStorage.setItem('rafiki-clients', JSON.stringify(backup.clients));
          localStorage.setItem('rafiki-todos', JSON.stringify(backup.todos));
          localStorage.setItem('rafiki-money', JSON.stringify(backup.moneyEntries));
          
          if (backup.settings) {
            localStorage.setItem('rafiki-settings', JSON.stringify(backup.settings));
          }

          toast.success('Data imported successfully! Refreshing...');
          
          // Reload to apply changes
          setTimeout(() => {
            window.location.reload();
          }, 1000);

          resolve();
        } catch (error) {
          toast.error('Failed to import data. Invalid file format.');
          reject(error);
        }
      };

      reader.onerror = () => {
        toast.error('Failed to read file');
        reject(new Error('Failed to read file'));
      };

      reader.readAsText(file);
    });
  };

  const getStats = () => ({
    clientsCount: clients.clients.length,
    todosCount: todos.todos.length,
    moneyEntriesCount: money.entries.length,
  });

  return {
    exportData,
    importData,
    getStats,
    fileInputRef,
  };
}
