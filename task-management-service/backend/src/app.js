require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const connectDB = require('./config/database');

const authRoutes = require('./routes/auth.routes');
const taskRoutes = require('./routes/task.routes');
const notificationRoutes = require('./routes/notification.routes');

const app = express();
const server = http.createServer(app);

// Настройка CORS для обычных запросов
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Настройка Socket.IO с CORS
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
    transports: ['websocket', 'polling']
  },
  allowEIO3: true
});

global.io = io;

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);

// WebSocket аутентификация
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    console.error('WebSocket auth error:', err.message);
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log('🔌 Новое соединение:', socket.id, 'User ID:', socket.userId);

  if (socket.userId) {
    socket.join(`user_${socket.userId}`);
  }

  socket.on('join_user', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`👤 Пользователь ${userId} присоединился к комнате`);
  });

  socket.on('mark_notification_read', (notificationId) => {
    socket.emit('notification_read', notificationId);
  });

  socket.on('mark_all_notifications_read', () => {
    socket.emit('all_notifications_read');
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Отключение:', socket.id, 'Reason:', reason);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
  console.error('❌ Ошибка сервера:', err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      message: 'Ошибка валидации', 
      errors: err.errors 
    });
  }
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Неверный токен' });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Токен истек' });
  }
  
  res.status(500).json({ 
    message: 'Внутренняя ошибка сервера',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 обработчик
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Маршрут не найден',
    path: req.originalUrl 
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📡 WebSocket готов (CORS: ${process.env.FRONTEND_URL || 'http://localhost:8080'})`);
});

module.exports = { app, server };