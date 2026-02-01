import { io } from 'socket.io-client';
import { getWebSocketUrl } from '@/services/api';

export default {
  namespaced: true,
  state: {
    socket: null,
    notifications: [],
    unreadCount: 0
  },
  mutations: {
    SET_SOCKET(state, socket) {
      state.socket = socket;
    },
    SET_NOTIFICATIONS(state, notifications) {
      state.notifications = notifications;
      state.unreadCount = notifications.filter(n => !n.read).length;
    },
    ADD_NOTIFICATION(state, notification) {
      state.notifications.unshift(notification);
      if (!notification.read) state.unreadCount++;
    },
    MARK_AS_READ(state, id) {
      const notif = state.notifications.find(n => n._id === id);
      if (notif && !notif.read) {
        notif.read = true;
        state.unreadCount--;
      }
    },
    MARK_ALL_AS_READ(state) {
      state.notifications.forEach(n => n.read = true);
      state.unreadCount = 0;
    }
  },
  actions: {
    initSocket({ commit, rootGetters, state }) {
      // Проверка: уже подключено или нет пользователя
      if (state.socket?.connected) return;
      
      const userId = rootGetters['user/currentUser']?._id;
      const token = localStorage.getItem('token');
      
      if (!userId || !token) {
        console.warn('Невозможно подключить WebSocket: отсутствует пользователь или токен');
        return;
      }

      const socketUrl = getWebSocketUrl();

      const socket = io(socketUrl, {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ['websocket', 'polling'] // Добавляем оба транспорта
      });

      socket.on('connect', () => {
        console.log('✅ WebSocket подключён');
        socket.emit('join_user', userId);
      });

      socket.on('new_notification', (notification) => {
        console.log('📨 Новое уведомление:', notification);
        commit('ADD_NOTIFICATION', notification);
      });

      socket.on('notification_read', (id) => {
        commit('MARK_AS_READ', id);
      });

      socket.on('all_notifications_read', () => {
        commit('MARK_ALL_AS_READ');
      });

      socket.on('connect_error', (error) => {
        console.error('❌ WebSocket ошибка подключения:', error.message);
      });

      socket.on('disconnect', (reason) => {
        console.log('🔌 WebSocket отключён:', reason);
      });

      commit('SET_SOCKET', socket);
    },

    destroySocket({ state, commit }) {
      if (state.socket) {
        state.socket.removeAllListeners();
        state.socket.disconnect();
        commit('SET_SOCKET', null);
      }
    },

    async fetchNotifications({ commit }) {
      try {
        const response = await fetch('/api/notifications', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        
        // Проверяем, что ответ не пустой
        if (!text.trim()) {
          console.warn('Пустой ответ от сервера уведомлений');
          commit('SET_NOTIFICATIONS', []);
          return;
        }
        
        const data = JSON.parse(text);
        commit('SET_NOTIFICATIONS', data.data || []);
      } catch (error) {
        console.error('Ошибка загрузки уведомлений:', error.message);
        commit('SET_NOTIFICATIONS', []);
      }
    },

    async markAsRead({ commit, state }, id) {
      try {
        const response = await fetch(`/api/notifications/${id}/read`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        commit('MARK_AS_READ', id);
        
        // Отправляем через сокет если есть соединение
        if (state.socket?.connected) {
          state.socket.emit('mark_notification_read', id);
        }
        
        return data;
      } catch (error) {
        console.error('Ошибка отметки уведомления:', error.message);
        // Локально помечаем как прочитанное даже при ошибке сервера
        commit('MARK_AS_READ', id);
        throw error;
      }
    },

    async markAllAsRead({ commit, state }) {
      try {
        const response = await fetch('/api/notifications/read-all', {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        commit('MARK_ALL_AS_READ');
        
        if (state.socket?.connected) {
          state.socket.emit('mark_all_notifications_read');
        }
        
        return data;
      } catch (error) {
        console.error('Ошибка отметки всех уведомлений:', error.message);
        // Локально помечаем все как прочитанные
        commit('MARK_ALL_AS_READ');
        throw error;
      }
    }
  },
  getters: {
    unreadCount: state => state.unreadCount,
    allNotifications: state => state.notifications
  }
};