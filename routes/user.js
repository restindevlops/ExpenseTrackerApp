const path = require('path');

const express = require('express');

const userController = require('../controllers/user');

const router = express.Router();

// Sign up => POST
router.post('/signup', userController.postSignUp);

// Login => POST
router.post('/login', userController.postLogin);

module.exports = router;
