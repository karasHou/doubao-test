import React, { useState } from 'react';

interface Category {
  id: number;
  name: string;
}

interface ExpenseFormProps {
  categories: Category[];
  onAddExpense: (data: any) => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ categories, onAddExpense }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const expenseData = {
      amount: parseFloat(amount),
      description,
      category_id: parseInt(categoryId),
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      date: new Date(date).toISOString()
    };

    onAddExpense(expenseData);

    setAmount('');
    setDescription('');
    setCategoryId('');
    setTags('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>添加消费记录</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
        <div className="form-group">
          <label>金额</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>分类</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            <option value="">请选择分类</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>日期</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>标签（逗号分隔）</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="例如：午餐,工作餐"
          />
        </div>
      </div>
      <div className="form-group">
        <label>描述</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </div>
      <button type="submit" className="btn btn-primary">添加</button>
    </form>
  );
};

export default ExpenseForm;
