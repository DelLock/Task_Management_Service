<template>
  <v-app-bar color="primary" dark app>
    <v-app-bar-nav-icon @click="drawer = !drawer" />
    <v-toolbar-title>Task Manager</v-toolbar-title>

    <v-spacer />

    <v-btn icon @click="$router.push('/notifications')">
      <v-badge :content="unreadCount" color="error" overlap v-if="unreadCount > 0">
        <v-icon>mdi-bell</v-icon>
      </v-badge>
      <v-icon v-else>mdi-bell-outline</v-icon>
    </v-btn>

    <v-menu offset-y>
      <template v-slot:activator="{ props }">
        <v-btn icon v-bind="props">
          <v-icon>mdi-account</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item @click="$router.push('/profile')">
          <v-list-item-title>Профиль</v-list-item-title>
        </v-list-item>
        <v-list-item @click="logout">
          <v-list-item-title>Выйти</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>

  <v-navigation-drawer v-model="drawer" temporary>
    <v-list>
      <v-list-item to="/" prepend-icon="mdi-view-dashboard">Главная</v-list-item>
      <v-list-item to="/notifications" prepend-icon="mdi-bell">
        Уведомления
        <v-badge 
          v-if="unreadCount > 0" 
          :content="unreadCount" 
          color="error" 
          inline 
          class="ml-2"
        />
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'AppBar',
  data: () => ({ drawer: false }),
  computed: {
    ...mapGetters('notifications', ['unreadCount'])
  },
  methods: {
    ...mapActions('user', ['logout'])
  }
};
</script>