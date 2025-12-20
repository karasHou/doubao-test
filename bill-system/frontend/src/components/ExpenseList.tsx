import React from 'react';

interface Expense {
  id: number;
  amount: number;
  description: string;
  category_id: number;
  tags: string[];
  date: string;
  category_name?: string;
}

interface Category {
  id: number;
  name: string;
  color: string;
}

interface ExpenseListProps {
  expenses: Expense[];
  categories: Category[];
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, categories }) => {
  const getCategoryColor = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#1890ff';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  return (
    <div>
      {expenses.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>
          暂无消费记录
        </div>
      ) : (
        expenses.map(expense => (
          <div key={expense.id} className="expense-item">
            <div className="expense-info">
              <div style={{ fontWeight: '500' }}>
                {expense.description || '无描述'}
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                {formatDate(expense.date)}
                {expense.tags.length > 0 && (
                  <span style={{ marginLeft: '10px' }}>
                    标签: {expense.tags.join(', ')}
                  </span>
                )}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="expense-amount">
                ¥{parseFloat(expense.amount.toString()).toFixed(2)}
              </div>
              <div style={{ marginTop: '4px' }}>
                <span
                  className="category-tag"
                  style={{ backgroundColor: getCategoryColor(expense.category_id) }}
                >
                  {expense.category_name || categories.find(c => c.id === expense.category_id)?.name}
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ExpenseList;
