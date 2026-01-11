import { useLocalStorage } from './useLocalStorage';
import { Todo } from '@/types';
import { mockTodos } from '@/data/mockData';

const STORAGE_KEY = 'rawtask_todos';

export function useTodos() {
  const [todos, setTodos] = useLocalStorage<Todo[]>(STORAGE_KEY, mockTodos);

  const addTodo = (todo: Omit<Todo, 'id' | 'createdAt'>) => {
    const newTodo: Todo = {
      ...todo,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTodos(prev => [...prev, newTodo]);
    return newTodo;
  };

  const updateTodo = (id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt'>>) => {
    setTodos(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const toggleTodo = (id: string) => {
    setTodos(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const getTodo = (id: string) => todos.find(t => t.id === id);

  const getTodayTodos = () => {
    const today = new Date().toISOString().split('T')[0];
    return todos.filter(t => t.dueDate === today);
  };

  const getUnpaidCompletedTodos = () => {
    return todos.filter(t => t.completed && t.paymentStatus === 'unpaid');
  };

  return {
    todos,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    getTodo,
    getTodayTodos,
    getUnpaidCompletedTodos,
  };
}
