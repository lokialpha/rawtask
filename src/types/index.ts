export type PaymentStatus = 'unpaid' | 'paid' | 'no-payment';

export interface Client {
  id: string;
  name: string;
  color: 'blue' | 'purple' | 'pink' | 'teal' | 'orange';
}

export interface Todo {
  id: string;
  title: string;
  clientId: string;
  completed: boolean;
  dueDate: string;
  paymentStatus: PaymentStatus;
  amount?: number;
  linkedMoneyId?: string;
  createdAt: string;
}

export interface MoneyEntry {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  description?: string;
  linkedTodoId?: string;
  createdAt: string;
}

export interface DaySummary {
  income: number;
  expense: number;
  pendingUnpaid: number;
  pendingAmount: number;
}
