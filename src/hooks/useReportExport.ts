import { useData } from '@/contexts/DataContext';
import { useSettings } from '@/hooks/useSettings';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function useReportExport() {
  const { todos, money, clients } = useData();
  const { settings, formatCurrency } = useSettings();

  const getClientName = (clientId: string) => {
    return clients.clients.find(c => c.id === clientId)?.name || 'Unknown';
  };

  const generateCSVContent = () => {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Linked Task'];
    
    const rows = money.entries
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map(entry => {
        const linkedTask = entry.linkedTodoId 
          ? todos.todos.find(t => t.id === entry.linkedTodoId)?.title 
          : '';
        return [
          format(new Date(entry.date), 'yyyy-MM-dd'),
          entry.type === 'income' ? 'Income' : 'Expense',
          entry.category,
          entry.description || '',
          entry.amount.toString(),
          linkedTask || ''
        ];
      });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    return csvContent;
  };

  const exportCSV = () => {
    try {
      const csvContent = generateCSVContent();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `financial-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('CSV report downloaded');
    } catch (error) {
      toast.error('Failed to export CSV');
      console.error('CSV export error:', error);
    }
  };

  const generatePDFContent = () => {
    const totalIncome = money.entries
      .filter(e => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0);
    
    const totalExpense = money.entries
      .filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0);

    const incomeByCategory: Record<string, number> = {};
    const expenseByCategory: Record<string, number> = {};

    money.entries.forEach(e => {
      const category = e.category || 'Other';
      if (e.type === 'income') {
        incomeByCategory[category] = (incomeByCategory[category] || 0) + e.amount;
      } else {
        expenseByCategory[category] = (expenseByCategory[category] || 0) + e.amount;
      }
    });

    const completedTasks = todos.todos.filter(t => t.completed).length;
    const paidTasks = todos.todos.filter(t => t.paymentStatus === 'paid').length;
    const unpaidTasks = todos.todos.filter(t => t.paymentStatus === 'unpaid' && t.completed).length;

    return {
      generatedAt: format(new Date(), 'PPP'),
      currency: settings.currency.symbol,
      summary: {
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,
        totalEntries: money.entries.length,
      },
      incomeByCategory: Object.entries(incomeByCategory)
        .sort((a, b) => b[1] - a[1]),
      expenseByCategory: Object.entries(expenseByCategory)
        .sort((a, b) => b[1] - a[1]),
      taskStats: {
        total: todos.todos.length,
        completed: completedTasks,
        paid: paidTasks,
        unpaid: unpaidTasks,
      },
      recentTransactions: money.entries
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 20),
    };
  };

  const exportPDF = () => {
    try {
      const data = generatePDFContent();
      
      // Generate HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Financial Report - ${data.generatedAt}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1a1a1a; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #e5e5e5; }
            .header h1 { font-size: 28px; font-weight: 700; color: #1a1a1a; }
            .header p { color: #666; margin-top: 8px; }
            .section { margin-bottom: 32px; }
            .section h2 { font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #333; border-bottom: 1px solid #eee; padding-bottom: 8px; }
            .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
            .summary-card { background: #f9fafb; border-radius: 8px; padding: 16px; text-align: center; }
            .summary-card .value { font-size: 24px; font-weight: 700; }
            .summary-card .label { font-size: 12px; color: #666; margin-top: 4px; }
            .income { color: #16a34a; }
            .expense { color: #dc2626; }
            .category-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
            .category-column h3 { font-size: 14px; font-weight: 600; margin-bottom: 12px; }
            .category-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
            .category-item span:first-child { color: #666; }
            .category-item span:last-child { font-weight: 500; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; }
            th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; }
            th { background: #f9fafb; font-weight: 600; color: #333; }
            .type-income { color: #16a34a; font-weight: 500; }
            .type-expense { color: #dc2626; font-weight: 500; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📊 Financial Report</h1>
            <p>Generated on ${data.generatedAt}</p>
          </div>
          
          <div class="section">
            <h2>Summary</h2>
            <div class="summary-grid">
              <div class="summary-card">
                <div class="value income">${data.currency}${data.summary.totalIncome.toLocaleString()}</div>
                <div class="label">Total Income</div>
              </div>
              <div class="summary-card">
                <div class="value expense">${data.currency}${data.summary.totalExpense.toLocaleString()}</div>
                <div class="label">Total Expenses</div>
              </div>
              <div class="summary-card">
                <div class="value" style="color: ${data.summary.netBalance >= 0 ? '#16a34a' : '#dc2626'}">${data.currency}${data.summary.netBalance.toLocaleString()}</div>
                <div class="label">Net Balance</div>
              </div>
              <div class="summary-card">
                <div class="value">${data.summary.totalEntries}</div>
                <div class="label">Transactions</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Category Breakdown</h2>
            <div class="category-list">
              <div class="category-column">
                <h3 style="color: #16a34a;">💰 Income by Category</h3>
                ${data.incomeByCategory.length > 0 
                  ? data.incomeByCategory.map(([cat, amount]) => `
                    <div class="category-item">
                      <span>${cat}</span>
                      <span class="income">${data.currency}${amount.toLocaleString()}</span>
                    </div>
                  `).join('')
                  : '<p style="color: #999; font-size: 13px;">No income recorded</p>'
                }
              </div>
              <div class="category-column">
                <h3 style="color: #dc2626;">💸 Expenses by Category</h3>
                ${data.expenseByCategory.length > 0
                  ? data.expenseByCategory.map(([cat, amount]) => `
                    <div class="category-item">
                      <span>${cat}</span>
                      <span class="expense">${data.currency}${amount.toLocaleString()}</span>
                    </div>
                  `).join('')
                  : '<p style="color: #999; font-size: 13px;">No expenses recorded</p>'
                }
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Task Statistics</h2>
            <div class="summary-grid">
              <div class="summary-card">
                <div class="value">${data.taskStats.total}</div>
                <div class="label">Total Tasks</div>
              </div>
              <div class="summary-card">
                <div class="value income">${data.taskStats.completed}</div>
                <div class="label">Completed</div>
              </div>
              <div class="summary-card">
                <div class="value">${data.taskStats.paid}</div>
                <div class="label">Paid</div>
              </div>
              <div class="summary-card">
                <div class="value expense">${data.taskStats.unpaid}</div>
                <div class="label">Unpaid</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Recent Transactions</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${data.recentTransactions.map(t => `
                  <tr>
                    <td>${format(new Date(t.date), 'MMM d, yyyy')}</td>
                    <td class="${t.type === 'income' ? 'type-income' : 'type-expense'}">${t.type === 'income' ? 'Income' : 'Expense'}</td>
                    <td>${t.category}</td>
                    <td>${t.description || '-'}</td>
                    <td style="text-align: right; font-weight: 500;" class="${t.type === 'income' ? 'type-income' : 'type-expense'}">${data.currency}${t.amount.toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </body>
        </html>
      `;

      // Open in new window for printing/saving as PDF
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 250);
        toast.success('PDF report opened - use Save as PDF in print dialog');
      } else {
        toast.error('Please allow popups to generate PDF');
      }
    } catch (error) {
      toast.error('Failed to export PDF');
      console.error('PDF export error:', error);
    }
  };

  return {
    exportCSV,
    exportPDF,
    entriesCount: money.entries.length,
  };
}