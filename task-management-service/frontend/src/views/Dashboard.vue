<template>
  <v-container>
    <v-row>
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <h1>Мои задачи</h1>
        <v-btn color="primary" @click="openCreateDialog">+ Новая задача</v-btn>
      </v-col>
    </v-row>

    <v-row v-if="loading">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate />
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col cols="12" md="4" v-for="task in tasks" :key="task._id">
        <TaskCard 
          :task="task" 
          @edit="openEditDialog" 
          @delete="handleDelete" 
        />
      </v-col>
      
      <v-col v-if="tasks.length === 0" cols="12" class="text-center">
        <v-alert type="info">Задачи не найдены. Создайте первую задачу!</v-alert>
      </v-col>
    </v-row>

    <TaskForm 
      v-model="dialog" 
      :task-to-edit="selectedTask"
      @saved="handleTaskSaved" 
    />

    <v-snackbar v-model="toast.show" :color="toast.color" :timeout="3000">
      {{ toast.message }}
    </v-snackbar>
  </v-container>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import TaskCard from '@/components/TaskCard.vue';
import TaskForm from '@/components/TaskForm.vue';

export default {
  name: 'Dashboard',
  components: { TaskCard, TaskForm },
  data: () => ({
    dialog: false,
    selectedTask: null,
    toast: {
      show: false,
      message: '',
      color: 'success'
    }
  }),
  computed: {
    ...mapState('tasks', ['tasks', 'loading'])
  },
  async created() {
    await this.fetchTasks();
  },
  methods: {
    ...mapActions('tasks', ['fetchTasks', 'deleteTask']),
    openCreateDialog() {
      this.selectedTask = null;
      this.dialog = true;
    },
    openEditDialog(task) {
      this.selectedTask = { ...task };
      this.dialog = true;
    },
    async handleTaskSaved() {
      await this.fetchTasks();
      this.showToast('Задача сохранена', 'success');
    },
    async handleDelete(taskId) {
      if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
        try {
          await this.deleteTask(taskId);
          this.showToast('Задача удалена', 'success');
        } catch (error) {
          console.error('Ошибка удаления задачи:', error);
          this.showToast(
            error.response?.data?.message || 'Ошибка удаления задачи',
            'error'
          );
        }
      }
    },
    showToast(message, color = 'success') {
      this.toast.message = message;
      this.toast.color = color;
      this.toast.show = true;
      
      setTimeout(() => {
        this.toast.show = false;
      }, 3000);
    }
  }
};
</script>