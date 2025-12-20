import React, { useState, useEffect } from 'react';
import EnergyChart from './components/EnergyChart';
import AlertNotification from './components/AlertNotification';
import ApiService from './services/api';
import wsClient from './services/websocket';

function App() {
  const [energyData, setEnergyData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [devices, setDevices] = useState([]);
  const [timeRange, setTimeRange] = useState('hour');

  // 加载设备列表
  useEffect(() => {
    ApiService.getDevices()
      .then(data => setDevices(data))
      .catch(error => console.error('加载设备列表失败:', error));
  }, []);

  // 加载历史数据
  useEffect(() => {
    const end = new Date();
    const start = new Date(end.getTime() - 60 * 60 * 1000); // 1小时前

    ApiService.getEnergyHistory(selectedDevice, start.toISOString(), end.toISOString())
      .then(data => setEnergyData(data))
      .catch(error => console.error('加载能耗数据失败:', error));
  }, [selectedDevice]);

  // 加载异常提醒
  useEffect(() => {
    ApiService.getAlerts()
      .then(data => setAlerts(data))
      .catch(error => console.error('加载异常提醒失败:', error));
  }, []);

  // WebSocket 实时数据
  useEffect(() => {
    wsClient.on('energy-update', (data) => {
      setEnergyData(prev => {
        const updated = [...prev, data];
        // 保持最多 1000 条数据
        return updated.slice(-1000);
      });
    });

    wsClient.on('alert', (data) => {
      setAlerts(prev => [data, ...prev]);
    });
  }, []);

  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
    const end = new Date();
    let start;

    switch (e.target.value) {
      case 'hour':
        start = new Date(end.getTime() - 60 * 60 * 1000);
        break;
      case 'day':
        start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        start = new Date(end.getTime() - 60 * 60 * 1000);
    }

    ApiService.getEnergyHistory(selectedDevice, start.toISOString(), end.toISOString())
      .then(data => setEnergyData(data))
      .catch(error => console.error('加载能耗数据失败:', error));
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>家庭能耗监控系统</h1>
      </header>

      <main className="app-main">
        <section className="controls">
          <div className="control-group">
            <label>选择设备:</label>
            <select onChange={(e) => setSelectedDevice(e.target.value)} value={selectedDevice || ''}>
              <option value="">所有设备</option>
              {devices.map(device => (
                <option key={device.id} value={device.id}>{device.name}</option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label>时间范围:</label>
            <select onChange={handleTimeRangeChange} value={timeRange}>
              <option value="hour">最近1小时</option>
              <option value="day">最近1天</option>
              <option value="week">最近1周</option>
              <option value="month">最近1个月</option>
            </select>
          </div>
        </section>

        <section className="chart-section">
          <h2>能耗曲线</h2>
          <div className="chart-container">
            {energyData.length > 0 ? (
              <EnergyChart data={energyData} />
            ) : (
              <p>正在加载数据...</p>
            )}
          </div>
        </section>

        <section className="alerts-section">
          <AlertNotification alerts={alerts} />
        </section>
      </main>

      <style jsx>{`
        .App {
          min-height: 100vh;
          background-color: #f5f5f5;
          font-family: Arial, sans-serif;
        }

        .app-header {
          background-color: #282c34;
          padding: 20px;
          color: white;
          text-align: center;
        }

        .app-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .controls {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
          padding: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .chart-section {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }

        .chart-container {
          height: 400px;
        }

        .alerts-section {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .alerts-container h3 {
          margin-top: 0;
        }

        .alerts-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .alert {
          padding: 10px;
          border-radius: 4px;
          border-left: 4px solid;
        }

        .alert-warning {
          background-color: #fff3cd;
          border-color: #ffc107;
        }

        .alert-error {
          background-color: #f8d7da;
          border-color: #dc3545;
        }

        .alert-info {
          background-color: #d1ecf1;
          border-color: #0c5460;
        }

        .alert-time {
          font-size: 0.8em;
          color: #666;
        }
      `}</style>
    </div>
  );
}

export default App;
