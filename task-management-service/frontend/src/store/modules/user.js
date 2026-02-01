import api from '@/services/api';

export default {
  namespaced: true,
  state: {
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    isAuthenticated: !!localStorage.getItem('token')
  },
  mutations: {
    SET_AUTH(state, { token, user }) {
      state.token = token;
      state.user = user;
      state.isAuthenticated = true;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
    LOGOUT(state) {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
  actions: {
    async register({ commit }, credentials) {
      const response = await api.post('/auth/register', credentials);
      commit('SET_AUTH', response.data);
      return response.data;
    },
    async login({ commit, dispatch }, credentials) {
  const response = await api.post('/auth/login', credentials);
  commit('SET_AUTH', response.data);
  await dispatch('notifications/initSocket', null, { root: true });
  return response.data;
},
    async logout({ commit, dispatch }) {
      commit('LOGOUT');
      await dispatch('notifications/destroySocket', null, { root: true });
    },
    async fetchProfile({ commit, state }) {
      const response = await api.get('/auth/profile');
      commit('SET_AUTH', { token: state.token, user: response.data.user });
      return response.data;
    }
  },
  getters: {
    currentUser: state => state.user,
    isAuthenticated: state => state.isAuthenticated
  }
};