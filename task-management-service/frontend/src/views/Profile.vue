<template>
  <v-container>
    <v-card max-width="600" class="mx-auto pa-6">
      <v-card-title>Профиль</v-card-title>
      <v-card-text v-if="user">
        <p><strong>Имя:</strong> {{ user.username }}</p>
        <p><strong>Email:</strong> {{ user.email }}</p>
        <p><strong>Зарегистрирован:</strong> {{ formatDate(user.createdAt) }}</p>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default {
  computed: {
    ...mapGetters('user', ['currentUser']),
    user() {
      return this.currentUser;
    }
  },
  methods: {
    formatDate(date) {
      return format(new Date(date), 'dd.MM.yyyy HH:mm', { locale: ru });
    }
  }
};
</script>