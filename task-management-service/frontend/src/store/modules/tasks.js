import api from '@/services/api';

export default {
  namespaced: true,
  state: {
    tasks: [],
    loading: false,
    pagination: {}
  },
  mutations: {
    SET_TASKS(state, { data, pagination }) {
      state.tasks = data;
      state.pagination = pagination || {};
    },
    ADD_TASK(state, task) {
      state.tasks.unshift(task);
    },
    UPDATE_TASK(state, updatedTask) {
      const index = state.tasks.findIndex(t => t._id === updatedTask._id);
      if (index !== -1) {
        state.tasks.splice(index, 1, updatedTask);
      } else {
        state.tasks.unshift(updatedTask);
      }
    },
    DELETE_TASK(state, taskId) {
      state.tasks = state.tasks.filter(t => t._id !== taskId);
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    }
  },
  actions: {
    async fetchTasks({ commit }, params = {}) {
      commit('SET_LOADING', true);
      try {
        const response = await api.get('/tasks', { params });
        commit('SET_TASKS', response.data);
        return response.data;
      } catch (error) {
        console.error('Ошибка загрузки задач:', error);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async createTask({ commit }, taskData) {
      try {
        const response = await api.post('/tasks', taskData);
        commit('ADD_TASK', response.data.data);
        return response.data.data;
      } catch (error) {
        console.error('Ошибка создания задачи:', error);
        throw error;
      }
    },
    async updateTask({ commit }, { id, data }) {
      try {
        const response = await api.put(`/tasks/${id}`, data);
        commit('UPDATE_TASK', response.data.data);
        return response.data.data;
      } catch (error) {
        console.error('Ошибка обновления задачи:', error);
        throw error;
      }
    },
    async deleteTask({ commit }, id) {
      try {
        await api.delete(`/tasks/${id}`);
        commit('DELETE_TASK', id);
      } catch (error) {
        console.error('Ошибка удаления задачи:', error);
        throw error;
      }
    }
  },
  getters: {
    tasksByStatus: (state) => (status) => {
      return state.tasks.filter(task => task.status === status);
    },
    todayTasks: (state) => {
      const today = new Date().setHours(0, 0, 0, 0);
      return state.tasks.filter(task =>
        task.dueDate && new Date(task.dueDate).setHours(0, 0, 0, 0) === today
      );
    },
    getTaskById: (state) => (id) => {
      return state.tasks.find(task => task._id === id);
    }
  }
};