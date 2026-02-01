  const Task = require('../models/Task');
  const Notification = require('../models/Notification');
  const { validationResult } = require('express-validator');

  exports.getTasks = async (req, res) => {
    try {
      const { status, priority, category, search, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

      const filter = { userId: req.user.id };
      if (status) filter.status = status;
      if (priority) filter.priority = priority;
      if (category) filter.category = category;
      if (search) {
        filter.$or = [
          { title: new RegExp(search, 'i') },
          { description: new RegExp(search, 'i') }
        ];
      }

      const sort = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Пагинация
      const skip = (page - 1) * limit;

      const tasks = await Task.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Task.countDocuments(filter);

      res.json({
        success: true,
        data: tasks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Ошибка получения задач:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  };

  exports.createTask = async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, status, priority, dueDate, category } = req.body;

      // Валидация длины
      if (title && title.length > 200) {
        return res.status(400).json({ 
          message: 'Заголовок слишком длинный (макс. 200 символов)' 
        });
      }

      if (description && description.length > 1000) {
        return res.status(400).json({ 
          message: 'Описание слишком длинное (макс. 1000 символов)' 
        });
      }

      const task = await Task.create({
        title,
        description,
        status: status || 'todo',
        priority: priority || 'medium',
        dueDate: dueDate || null,
        category: category || 'general',
        userId: req.user.id
      });

      // Создаем уведомление если есть дедлайн
      if (dueDate) {
        try {
          const notification = await Notification.create({
            userId: req.user.id,
            type: 'task_created',
            message: `Задача "${title}" создана с дедлайном ${new Date(dueDate).toLocaleDateString('ru-RU')}`,
            data: { taskId: task._id }
          });

          if (global.io) {
            global.io.to(`user_${req.user.id}`).emit('new_notification', notification);
          }
        } catch (notifError) {
          console.error('Ошибка создания уведомления:', notifError);
        }
      }

      res.status(201).json({
        success: true,
        data: task
      });
    } catch (error) {
      console.error('Ошибка создания задачи:', error);
      
      if (error.name === 'ValidationError') {
        return res.status(400).json({ 
          message: 'Ошибка валидации данных', 
          details: error.errors 
        });
      }
      
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  };

  exports.getTask = async (req, res) => {
    try {
      const task = await Task.findOne({
        _id: req.params.id,
        userId: req.user.id
      });

      if (!task) {
        return res.status(404).json({ message: 'Задача не найдена' });
      }

      res.json({
        success: true,
        data: task
      });
    } catch (error) {
      console.error('Ошибка получения задачи:', error);
      
      if (error.name === 'CastError') {
        return res.status(400).json({ message: 'Неверный формат ID задачи' });
      }
      
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  };

  exports.updateTask = async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, status, priority, dueDate, category } = req.body;

      // Валидация длины
      if (title && title.length > 200) {
        return res.status(400).json({ 
          message: 'Заголовок слишком длинный (макс. 200 символов)' 
        });
      }

      if (description && description.length > 1000) {
        return res.status(400).json({ 
          message: 'Описание слишком длинное (макс. 1000 символов)' 
        });
      }

      const task = await Task.findOne({
        _id: req.params.id,
        userId: req.user.id
      });

      if (!task) {
        return res.status(404).json({ message: 'Задача не найдена' });
      }

      const oldStatus = task.status;

      task.title = title || task.title;
      task.description = description || task.description;
      task.status = status || task.status;
      task.priority = priority || task.priority;
      task.dueDate = dueDate || task.dueDate;
      task.category = category || task.category;

      await task.save();

      // Создаем уведомление при завершении задачи
      if (oldStatus !== 'completed' && task.status === 'completed') {
        try {
          const notification = await Notification.create({
            userId: req.user.id,
            type: 'task_completed',
            message: `Задача "${task.title}" завершена!`,
            data: { taskId: task._id }
          });

          if (global.io) {
            global.io.to(`user_${req.user.id}`).emit('new_notification', notification);
          }
        } catch (notifError) {
          console.error('Ошибка создания уведомления:', notifError);
        }
      }

      res.json({
        success: true,
        data: task
      });
    } catch (error) {
      console.error('Ошибка обновления задачи:', error);
      
      if (error.name === 'ValidationError') {
        return res.status(400).json({ 
          message: 'Ошибка валидации данных', 
          details: error.errors 
        });
      }
      
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  };

  exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: 'Задача не найдена' 
      });
    }

    res.status(204).end();
  } catch (error) {
    console.error('Ошибка удаления задачи:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        message: 'Неверный формат ID задачи' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Ошибка сервера при удалении задачи' 
    });
  }
};