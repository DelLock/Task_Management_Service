require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Task = require('./models/Task');

const seedDatabase = async () => {
  try {
    // Подключаемся к базе данных
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB подключен для сидинга');

    // Очищаем существующие данные
    await User.deleteMany({});
    await Task.deleteMany({});
    console.log('🗑️  Старые данные очищены');

    // Создаем тестового пользователя
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: hashedPassword
    });
    
    console.log(`👤 Создан пользователь: ${user.username}`);

    // Создаем тестовые задачи
    const tasks = [
      {
        title: 'Изучить Vue.js',
        description: 'Изучить основы Vue.js и Vuex',
        status: 'completed',
        priority: 'high',
        dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // неделю назад
        category: 'Обучение',
        userId: user._id
      },
      {
        title: 'Создать проект',
        description: 'Разработать новое приложение',
        status: 'in-progress',
        priority: 'medium',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // через 3 дня
        category: 'Работа',
        userId: user._id
      },
      {
        title: 'Купить продукты',
        description: 'Молоко, хлеб, яйца',
        status: 'todo',
        priority: 'low',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // завтра
        category: 'Личное',
        userId: user._id
      },
      {
        title: 'Подготовить отчет',
        description: 'Еженедельный отчет по проекту',
        status: 'todo',
        priority: 'high',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // послезавтра
        category: 'Работа',
        userId: user._id
      },
      {
        title: 'Записаться к врачу',
        description: 'Посетить стоматолога',
        status: 'todo',
        priority: 'medium',
        dueDate: null,
        category: 'Здоровье',
        userId: user._id
      }
    ];

    const createdTasks = await Task.insertMany(tasks);
    console.log(`✅ Создано ${createdTasks.length} задач`);

    console.log('🎉 Сидинг базы данных завершен успешно!');
    console.log('\nДанные для входа:');
    console.log('Email: test@example.com');
    console.log('Пароль: password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка сидинга:', error);
    process.exit(1);
  }
};

seedDatabase();