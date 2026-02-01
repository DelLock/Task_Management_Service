import { createStore } from 'vuex';
import user from './modules/user';
import tasks from './modules/tasks';
import notifications from './modules/notifications';

export default createStore({
  modules: {
    user,
    tasks,
    notifications
  }
});