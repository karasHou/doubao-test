import React, { useState, useEffect } from 'react';
import './App.css';
import { 快递 } from './types/快递';
import { 快递API } from './services/api';
import 快递录入Form from './components/快递录入Form';
import 快递列表 from './components/快递列表';

function App() {
  const [快递列表数据, set快递列表数据] = useState<快递[]>([]);
  const [加载中, set加载中] = useState(true);

  const 加载快递列表 = async () => {
    try {
      set加载中(true);
      const 数据 = await 快递API.获取所有快递();
      set快递列表数据(数据);
    } catch (错误) {
      console.error('加载快递列表失败:', 错误);
    } finally {
      set加载中(false);
    }
  };

  const handle快递录入 = async (单号: string, 快递公司?: string) => {
    try {
      await 快递API.创建快递(单号, 快递公司);
      加载快递列表();
    } catch (错误) {
      console.error('录入快递失败:', 错误);
      alert('录入快递失败，请重试');
    }
  };

  const handle删除快递 = async (id: number) => {
    try {
      await 快递API.删除快递(id);
      加载快递列表();
    } catch (错误) {
      console.error('删除快递失败:', 错误);
      alert('删除快递失败，请重试');
    }
  };

  const handle同步物流 = async (单号: string) => {
    try {
      await 快递API.手动同步物流(单号);
      alert('已开始同步物流信息');
      加载快递列表();
    } catch (错误) {
      console.error('同步物流失败:', 错误);
      alert('同步物流失败，请重试');
    }
  };

  useEffect(() => {
    加载快递列表();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>个人快递管理工具</h1>
      </header>

      <main className="App-main">
        <快递录入Form onSubmit={handle快递录入} />
        {加载中 ? (
          <div className="loading">加载中...</div>
        ) : (
          <快递列表
            快递列表={快递列表数据}
            onDelete={handle删除快递}
            onSync={handle同步物流}
          />
        )}
      </main>
    </div>
  );
}

export default App;
