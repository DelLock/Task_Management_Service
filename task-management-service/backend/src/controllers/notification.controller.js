const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: notifications,
      count: notifications.length,
      unreadCount: notifications.filter(n => !n.read).length
    });
  } catch (error) {
    console.error('Ошибка получения уведомлений:', error);
    res.status(500).json({ 
      success: false,
      message: 'Ошибка сервера при получении уведомлений' 
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { read: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ 
        success: false,
        message: 'Уведомление не найдено' 
      });
    }

    // Отправляем через WebSocket
    if (global.io) {
      global.io.to(`user_${req.user.id}`).emit('notification_read', notification._id);
    }

    res.json({
      success: true,
      data: notification,
      message: 'Уведомление отмечено как прочитанное'
    });
  } catch (error) {
    console.error('Ошибка отметки уведомления:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        message: 'Неверный формат ID уведомления' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Ошибка сервера' 
    });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user.id, read: false },
      { 
        read: true, 
        readAt: new Date() 
      }
    );

    if (global.io) {
      global.io.to(`user_${req.user.id}`).emit('all_notifications_read');
    }

    res.json({
      success: true,
      message: `Все уведомления (${result.modifiedCount}) отмечены как прочитанные`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Ошибка отметки всех уведомлений:', error);
    res.status(500).json({ 
      success: false,
      message: 'Ошибка сервера' 
    });
  }
};