import React, { useState, useEffect } from 'react';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import StatsChart from './components/StatsChart';
import TrendChart from './components/TrendChart';
import './index.css';

const API_BASE_URL = 'http://localhost:3001/api';

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

function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/expenses`);
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAddExpense = async (expenseData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData),
      });

      if (response.ok) {
        fetchExpenses();
      }
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  return (
    <div>
      <div className="header">
        <div className="container">
          <h1>个人账单管理系统</h1>
        </div>
      </div>

      <div className="container">
        <div className="card">
          <ExpenseForm categories={categories} onAddExpense={handleAddExpense} />
        </div>

        <div className="charts-container">
          <div className="card">
            <h3>消费分类统计</h3>
            <StatsChart />
          </div>
          <div className="card">
            <h3>消费趋势</h3>
            <TrendChart />
          </div>
        </div>

        <div className="card">
          <h3>消费记录</h3>
          {loading ? (
            <div>加载中...</div>
          ) : (
            <ExpenseList expenses={expenses} categories={categories} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
