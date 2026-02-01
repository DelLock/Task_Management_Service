<template>
  <v-card>
    <v-card-title>{{ task.title }}</v-card-title>
    <v-card-text>
      <div v-if="task.description">{{ task.description }}</div>
      <v-chip
        :color="statusColor(task.status)"
        size="small"
        class="me-2 mt-2"
      >
        {{ statusText(task.status) }}
      </v-chip>
      <v-chip
        :color="priorityColor(task.priority)"
        size="small"
        class="mt-2"
      >
        {{ priorityText(task.priority) }}
      </v-chip>
      <div v-if="task.dueDate" class="mt-2">
        📅 {{ formatDate(task.dueDate) }}
      </div>
    </v-card-text>
    <v-card-actions>
      <v-btn size="small" @click="$emit('edit', task)">Редактировать</v-btn>
      <v-btn size="small" color="error" @click="$emit('delete', task._id)">
        Удалить
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default {
  props: { task: { type: Object, required: true } },
  emits: ['edit', 'delete'],
  methods: {
    formatDate(date) {
      return format(new Date(date), 'dd MMMM yyyy', { locale: ru });
    },
    statusColor(status) {
      return { todo: 'grey', 'in-progress': 'warning', completed: 'success' }[status] || 'grey';
    },
    statusText(status) {
      return { todo: 'К выполнению', 'in-progress': 'В работе', completed: 'Завершено' }[status];
    },
    priorityColor(p) {
      return { low: 'info', medium: 'warning', high: 'error' }[p] || 'info';
    },
    priorityText(p) {
      return { low: 'Низкий', medium: 'Средний', high: 'Высокий' }[p];
    }
  }
};
</script>