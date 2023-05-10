const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Role = require('../models/Role');
const bcrypt = require('bcrypt');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('register', {title: 'Express'});
});

router.post('/', async (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const passwordConfirm = req.body.passwordConfirm;

    if (password !== passwordConfirm) {
        res.render('register', {error: 'Passwords must match'});
    }

    const existingUsername = await User.findOne({username: username});
    if (existingUsername) {
        res.render('register', {error: 'Username already exists'});
        return;
    }

    // Проверка на существование пользователя с такой почтой
    const existingEmail = await User.findOne({email: email});
    if (existingEmail) {
        res.render('register', {error: 'Email already exists'});
        return;
    }

    const role = await Role.findOne({name: 'User'});

    const newUser = new User({
        username,
        email,
        password: await bcrypt.hash(password, 10),
        role: role._id
    });

    try {
        await newUser.save();
        res.redirect('/login'); // Перенаправление на страницу входа после успешной регистрации
    } catch (err) {
        res.render('register', { error: 'Error occurred while registering user' });
    }
});

module.exports = router;
