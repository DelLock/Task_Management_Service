<template>
  <v-container>
    <v-row>
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <h1>Уведомления</h1>
        <v-btn @click="markAllAsRead" :disabled="!unreadCount">Отметить всё как прочитанное</v-btn>
      </v-col>
    </v-row>

    <v-list>
      <v-list-item v-for="n in notifications" :key="n._id" :class="{ 'bg-grey-lighten-4': !n.read }">
        <v-list-item-title>{{ n.message }}</v-list-item-title>
        <v-list-item-subtitle>{{ formatDate(n.createdAt) }}</v-list-item-subtitle>
        <template v-slot:append>
          <v-btn icon @click="markAsRead(n._id)" v-if="!n.read">
            <v-icon>mdi-check</v-icon>
          </v-btn>
        </template>
      </v-list-item>
    </v-list>
  </v-container>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default {
  computed: {
    ...mapState('notifications', ['notifications', 'unreadCount'])
  },
  methods: {
    ...mapActions('notifications', ['markAsRead', 'markAllAsRead']),
    formatDate(date) {
      return format(new Date(date), 'dd MMM yyyy HH:mm', { locale: ru });
    }
  }
};
</script>