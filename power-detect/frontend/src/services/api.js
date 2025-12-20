const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:3005') + '/api';

class ApiService {
  static async getDevices() {
    const response = await fetch(`${API_BASE_URL}/devices`);
    if (!response.ok) throw new Error('获取设备列表失败');
    return response.json();
  }

  static async getEnergyHistory(deviceId, start, end) {
    let url = `${API_BASE_URL}/energy/history`;
    const params = new URLSearchParams();
    if (deviceId) params.append('deviceId', deviceId);
    if (start) params.append('start', start);
    if (end) params.append('end', end);
    if (params.toString()) url += `?${params.toString()}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('获取能耗历史失败');
    return response.json();
  }

  static async getEnergyStats(period, deviceId) {
    let url = `${API_BASE_URL}/energy/stats/${period}`;
    if (deviceId) url += `?deviceId=${deviceId}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('获取统计数据失败');
    return response.json();
  }

  static async getAlerts() {
    const response = await fetch(`${API_BASE_URL}/alerts`);
    if (!response.ok) throw new Error('获取异常提醒失败');
    return response.json();
  }
}

export default ApiService;
