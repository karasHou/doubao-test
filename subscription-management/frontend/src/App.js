import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    amount: '',
    currency: 'CNY',
    billingCycle: 'monthly',
    startDate: '',
    nextBillingDate: '',
    status: 'active'
  });

  useEffect(() => {
    fetchSubscriptions();
    fetchStats();
  }, []);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  const fetchSubscriptions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/subscriptions`);
      setSubscriptions(response.data);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_BASE_URL}/subscriptions/${editingId}`, formData);
      } else {
        await axios.post(`${API_BASE_URL}/subscriptions`, formData);
      }
      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchSubscriptions();
      fetchStats();
    } catch (error) {
      console.error('Error saving subscription:', error);
    }
  };

  const handleEdit = (subscription) => {
    setEditingId(subscription.id);
    setFormData(subscription);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这个订阅吗？')) {
      try {
        await axios.delete(`${API_BASE_URL}/subscriptions/${id}`);
        fetchSubscriptions();
        fetchStats();
      } catch (error) {
        console.error('Error deleting subscription:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      amount: '',
      currency: 'CNY',
      billingCycle: 'monthly',
      startDate: '',
      nextBillingDate: '',
      status: 'active'
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>订阅服务管理工具</h1>
        <div className="stats">
          <div className="stat-card">
            <h3>月度支出</h3>
            <p>¥{stats.monthlyTotal || '0.00'}</p>
          </div>
          <div className="stat-card">
            <h3>年度支出</h3>
            <p>¥{stats.annualTotal || '0.00'}</p>
          </div>
          <div className="stat-card">
            <h3>活跃订阅</h3>
            <p>{stats.activeCount || 0} / {stats.totalCount || 0}</p>
          </div>
        </div>
        <button className="add-button" onClick={() => setShowForm(true)}>
          + 添加订阅
        </button>
      </header>

      {showForm && (
        <div className="form-overlay">
          <form onSubmit={handleSubmit} className="subscription-form">
            <h2>{editingId ? '编辑订阅' : '添加订阅'}</h2>
            <div className="form-group">
              <label>服务名称</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>服务类型</label>
              <input
                type="text"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>金额</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
                required
              />
            </div>
            <div className="form-group">
              <label>计费周期</label>
              <select
                value={formData.billingCycle}
                onChange={(e) => setFormData({...formData, billingCycle: e.target.value})}
              >
                <option value="monthly">月度</option>
                <option value="annual">年度</option>
              </select>
            </div>
            <div className="form-group">
              <label>开始日期</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>下次扣费日期</label>
              <input
                type="date"
                value={formData.nextBillingDate}
                onChange={(e) => setFormData({...formData, nextBillingDate: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>状态</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="active">活跃</option>
                <option value="paused">已暂停</option>
                <option value="cancelled">已取消</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit">保存</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }}>取消</button>
            </div>
          </form>
        </div>
      )}

      <div className="subscriptions-list">
        {subscriptions.map((subscription) => (
          <div key={subscription.id} className={`subscription-card ${subscription.status}`}>
            <div className="subscription-header">
              <h3>{subscription.name}</h3>
              <span className={`status-badge ${subscription.status}`}>
                {subscription.status === 'active' ? '活跃' : subscription.status === 'paused' ? '已暂停' : '已取消'}
              </span>
            </div>
            <p className="subscription-type">{subscription.type}</p>
            <div className="subscription-details">
              <span className="amount">¥{subscription.amount}/{subscription.billingCycle === 'monthly' ? '月' : '年'}</span>
              <span>下次扣费: {subscription.nextBillingDate}</span>
            </div>
            <div className="subscription-actions">
              <button onClick={() => handleEdit(subscription)}>编辑</button>
              <button onClick={() => handleDelete(subscription.id)}>删除</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;