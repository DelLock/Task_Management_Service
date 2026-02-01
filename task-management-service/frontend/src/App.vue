<template>
  <v-app>
    <app-bar v-if="isAuthenticated" />
    <v-main>
      <router-view />
    </v-main>
    
    <v-snackbar v-model="showToast" :timeout="3000" :color="toastColor">
      {{ toastMessage }}
    </v-snackbar>
  </v-app>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import AppBar from '@/components/AppBar.vue';

export default {
  name: 'App',
  components: { AppBar },
  data: () => ({
    showToast: false,
    toastMessage: '',
    toastColor: 'success'
  }),
  computed: {
    ...mapGetters('user', ['isAuthenticated'])
  },
  watch: {
    isAuthenticated: {
      immediate: true,
      handler(val) {
        if (val) {
          this.initApp();
        }
      }
    }
  },
  mounted() {
    this.$toast = {
      success: (message) => this.showMessage(message, 'success'),
      error: (message) => this.showMessage(message, 'error'),
      info: (message) => this.showMessage(message, 'info')
    };
  },
  methods: {
    ...mapActions('user', ['fetchProfile']),
    ...mapActions('tasks', ['fetchTasks']),
    ...mapActions('notifications', ['fetchNotifications', 'initSocket']),
    
    async initApp() {
      try {
        await Promise.all([
          this.fetchProfile(),
          this.fetchTasks(),
          this.fetchNotifications()
        ]);
        
        const userId = this.$store.getters['user/currentUser']?._id;
        if (userId) {
          await this.initSocket();
        }
      } catch (error) {
        console.error('Ошибка инициализации приложения:', error);
      }
    },
    
    showMessage(message, color = 'success') {
      this.toastMessage = message;
      this.toastColor = color;
      this.showToast = true;
    }
  }
};
</script>