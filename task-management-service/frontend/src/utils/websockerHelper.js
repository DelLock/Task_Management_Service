export class WebSocketHelper {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  connect(url, token, userId) {
    if (this.socket?.connected) {
      return this.socket;
    }

    try {
      const { io } = require('socket.io-client');
      
      this.socket = io(url, {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        transports: ['websocket', 'polling'],
        timeout: 10000
      });

      this.setupEventHandlers(userId);
      
      return this.socket;
    } catch (error) {
      console.error('Ошибка создания WebSocket:', error);
      return null;
    }
  }

  setupEventHandlers(userId) {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ WebSocket подключён');
      this.reconnectAttempts = 0;
      
      if (userId) {
        this.socket.emit('join_user', userId);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket ошибка подключения:', error.message);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.warn('Достигнут максимум попыток переподключения');
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket отключён:', reason);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.reconnectAttempts = 0;
    }
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('WebSocket не подключен, событие не отправлено:', event);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export const webSocketHelper = new WebSocketHelper();