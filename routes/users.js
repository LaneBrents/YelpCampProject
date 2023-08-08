const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const users = require('../controllers/users');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');

// This renders the register form
router.get('/register', users.renderRegister);

// This actually creates the new user
router.post('/register', catchAsync(users.register));

// This renders the login form
router.get('/login', users.renderLogin)

// This actually logins the user
router.post('/login', storeReturnTo, passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), users.login);

// This loguts the current user
router.get('/logout', users.logout);

module.exports = router;
