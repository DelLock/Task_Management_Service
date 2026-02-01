const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask
} = require('../controllers/task.controller');
const { body } = require('express-validator');

const taskValidation = [
  body('title').trim().notEmpty().withMessage('Заголовок обязателен'),
  body('title').isLength({ max: 200 }).withMessage('Заголовок слишком длинный'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Описание слишком длинное'),
  body('status').optional().isIn(['todo', 'in-progress', 'completed']),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('dueDate').optional().isISO8601().withMessage('Неверный формат даты')
];

router.use(protect);

router.get('/', getTasks);
router.post('/', taskValidation, createTask);
router.get('/:id', getTask);
router.put('/:id', taskValidation, updateTask);
router.delete('/:id', deleteTask);

module.exports = router;