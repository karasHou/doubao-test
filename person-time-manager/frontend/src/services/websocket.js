const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3007';

export const setupWebSocket = (onMessage) => {
  const ws = new WebSocket(WS_URL.replace('http', 'ws').replace('https', 'wss'));

  ws.onopen = () => {
    console.log('WebSocket connected');
  };

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    console.log('WebSocket message:', message);
    onMessage(message);
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  ws.onclose = () => {
    console.log('WebSocket disconnected');
  };

  return ws;
};
