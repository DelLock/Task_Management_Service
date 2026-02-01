<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="pa-6">
          <v-card-title class="text-h5 text-center">Регистрация</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="handleRegister">
              <v-text-field
                v-model="username"
                label="Имя пользователя"
                required
                variant="outlined"
              />
              <v-text-field
                v-model="email"
                label="Email"
                type="email"
                required
                variant="outlined"
              />
              <v-text-field
                v-model="password"
                label="Пароль"
                type="password"
                required
                variant="outlined"
              />
              <v-btn type="submit" color="primary" block :loading="loading">
                Зарегистрироваться
              </v-btn>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn to="/login" variant="text">Уже есть аккаунт? Войти</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  data: () => ({
    username: '',
    email: '',
    password: '',
    loading: false
  }),
  methods: {
    ...mapActions('user', ['register']),
    async handleRegister() {
      this.loading = true;
      try {
        await this.register({
          username: this.username,
          email: this.email,
          password: this.password
        });
        this.$router.push('/');
      } catch (error) {
        console.error(error);
        alert('Ошибка регистрации');
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>