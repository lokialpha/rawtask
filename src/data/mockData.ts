import { Client, Todo, MoneyEntry } from '@/types';

export const mockClients: Client[] = [
  { id: '1', name: 'Acme Corp', color: 'blue' },
  { id: '2', name: 'StartupXYZ', color: 'purple' },
  { id: '3', name: 'Design Studio', color: 'pink' },
  { id: '4', name: 'TechFlow', color: 'teal' },
  { id: '5', name: 'Creative Agency', color: 'orange' },
];

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

export const mockTodos: Todo[] = [
  {
    id: '1',
    title: 'Design landing page mockups',
    clientId: '1',
    completed: false,
    dueDate: today,
    paymentStatus: 'unpaid',
    amount: 500,
    createdAt: yesterday,
  },
  {
    id: '2',
    title: 'Build React dashboard',
    clientId: '2',
    completed: true,
    dueDate: today,
    paymentStatus: 'paid',
    amount: 1200,
    linkedMoneyId: 'm1',
    createdAt: yesterday,
  },
  {
    id: '3',
    title: 'Write blog content',
    clientId: '3',
    completed: false,
    dueDate: today,
    paymentStatus: 'no-payment',
    createdAt: today,
  },
  {
    id: '4',
    title: 'API integration',
    clientId: '4',
    completed: true,
    dueDate: yesterday,
    paymentStatus: 'unpaid',
    amount: 800,
    createdAt: yesterday,
  },
  {
    id: '5',
    title: 'Logo revisions',
    clientId: '5',
    completed: false,
    dueDate: today,
    paymentStatus: 'unpaid',
    amount: 150,
    createdAt: today,
  },
];

export const mockMoneyEntries: MoneyEntry[] = [
  {
    id: 'm1',
    type: 'income',
    amount: 1200,
    category: 'Development',
    date: today,
    description: 'React dashboard - StartupXYZ',
    linkedTodoId: '2',
    createdAt: today,
  },
  {
    id: 'm2',
    type: 'income',
    amount: 350,
    category: 'Design',
    date: today,
    description: 'Icon set delivery',
    createdAt: today,
  },
  {
    id: 'm3',
    type: 'expense',
    amount: 49,
    category: 'Software',
    date: today,
    description: 'Figma subscription',
    createdAt: today,
  },
  {
    id: 'm4',
    type: 'expense',
    amount: 15,
    category: 'Tools',
    date: today,
    description: 'Domain renewal',
    createdAt: today,
  },
];

export const incomeCategories = [
  'Development',
  'Design',
  'Writing',
  'Consulting',
  'Marketing',
  'Other',
];

export const expenseCategories = [
  'Software',
  'Tools',
  'Equipment',
  'Office',
  'Marketing',
  'Travel',
  'Other',
];
