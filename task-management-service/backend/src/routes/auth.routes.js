const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const { body } = require('express-validator');

router.post('/register',
  [
    body('username').trim().isLength({ min: 3, max: 20 }),
    body('email').isEmail(),
    body('password').isLength({ min: 6 })
  ],
  register
);

router.post('/login', login);
router.get('/profile', protect, getProfile);

module.exports = router;