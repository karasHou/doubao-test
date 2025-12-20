class WebSocketClient {
  constructor() {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3005';
    const wsUrl = apiUrl.replace('http://', 'ws://').replace('https://', 'wss://');
    this.socket = new WebSocket(`${wsUrl}/ws`);

    this.socket.onopen = () => {
      console.log('WebSocket 已连接');
    };

    this.socket.onclose = () => {
      console.log('WebSocket 已断开');
      // 自动重连
      setTimeout(() => this.reconnect(), 5000);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket 错误:', error);
    };
  }

  reconnect() {
    console.log('尝试重新连接 WebSocket...');
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3005';
    const wsUrl = apiUrl.replace('http://', 'ws://').replace('https://', 'wss://');
    this.socket = new WebSocket(`${wsUrl}/ws`);
  }

  on(messageType, callback) {
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === messageType) {
        callback(data.data);
      }
    };
  }

  send(data) {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }
}

const wsClient = new WebSocketClient();

export default wsClient;
