<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="600px"
  >
    <v-card>
      <v-card-title>{{ editing ? 'Редактировать задачу' : 'Новая задача' }}</v-card-title>
      <v-card-text>
        <v-form ref="form">
          <v-text-field
            v-model="form.title"
            label="Заголовок *"
            :rules="[v => !!v || 'Заголовок обязателен']"
            required
          />
          <v-textarea v-model="form.description" label="Описание" />
          <v-select
            v-model="form.status"
            :items="statuses"
            label="Статус"
            item-title="text"
            item-value="value"
          />
          <v-select
            v-model="form.priority"
            :items="priorities"
            label="Приоритет"
            item-title="text"
            item-value="value"
          />
          <v-text-field
            v-model="form.dueDate"
            label="Срок выполнения"
            type="date"
            @update:model-value="formatDateForInput"
          />
          <v-text-field v-model="form.category" label="Категория" />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="close">Отмена</v-btn>
        <v-btn color="primary" @click="save" :loading="saving">Сохранить</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'TaskForm',
  props: {
    modelValue: Boolean,
    taskToEdit: Object
  },
  emits: ['update:modelValue', 'saved'],
  data() {
    return {
      saving: false,
      form: {
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: null,
        category: 'general'
      },
      statuses: [
        { text: 'К выполнению', value: 'todo' },
        { text: 'В работе', value: 'in-progress' },
        { text: 'Завершено', value: 'completed' }
      ],
      priorities: [
        { text: 'Низкий', value: 'low' },
        { text: 'Средний', value: 'medium' },
        { text: 'Высокий', value: 'high' }
      ]
    };
  },
  computed: {
    editing() {
      return !!this.form._id;
    }
  },
  watch: {
    modelValue(val) {
      if (val && this.taskToEdit) {
        this.loadTaskData();
      } else if (!val) {
        this.reset();
      }
    }
  },
  methods: {
    ...mapActions('tasks', ['createTask', 'updateTask']),
    close() {
      this.$emit('update:modelValue', false);
    },
    reset() {
      this.form = {
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: null,
        category: 'general'
      };
    },
    loadTaskData() {
      if (this.taskToEdit) {
        this.form = { ...this.taskToEdit };
        // Преобразуем дату в формат для input type="date"
        if (this.form.dueDate) {
          const date = new Date(this.form.dueDate);
          this.form.dueDate = date.toISOString().split('T')[0];
        }
      }
    },
    formatDateForInput(value) {
      if (value) {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          this.form.dueDate = date.toISOString().split('T')[0];
        }
      }
    },
    formatDateForApi(dateString) {
      if (!dateString) return null;
      const date = new Date(dateString);
      date.setHours(23, 59, 59, 999); // Устанавливаем конец дня
      return date;
    },
    async save() {
      if (!this.form.title.trim()) {
        alert('Заголовок обязателен');
        return;
      }

      this.saving = true;
      try {
        const taskData = {
          ...this.form,
          dueDate: this.formatDateForApi(this.form.dueDate)
        };

        if (this.editing) {
          await this.updateTask({
            id: taskData._id,
            data: taskData
          });
        } else {
          await this.createTask(taskData);
        }

        this.$emit('saved');
        this.close();
      } catch (error) {
        console.error('Ошибка сохранения задачи:', error);
        alert(error.response?.data?.message || 'Ошибка сохранения задачи');
      } finally {
        this.saving = false;
      }
    }
  }
};
</script>