const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('login', { title: 'Express' });
});

router.post('/', async function (req, res, next) {
    const email = req.body.email;
    const password = req.body.password;

    try {
        const user = await User.findOne({email: email}).populate('role');
        if (!user) {
            // Если пользователь с указанным именем пользователя не найден
            res.render('login', { error: 'Invalid email or password' });
        }else {
            // Сравнение пароля с хэшированным паролем в базе данных
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (isPasswordValid) {
                // Если аутентификация прошла успешно
                // Здесь вы можете установить сеанс или выпустить токен аутентификации, если используете JWT
                const token = generateAccessToken(user);
                res.cookie('token', token, { httpOnly: true, secure: true });
                res.redirect('/'); // перенаправление на главную страницу или другую страницу
            } else {
                // Если пароль недействителен
                res.render('login', { error: 'Invalid email or password' });
            }
        }
    } catch (error) {
        next(error);
    }
});

const generateAccessToken = (user) => {
    const payload = {
        userId: user._id,
        email: user.email,
        roleId: user.role._id,
        role: user.role.name
    }
    return jwt.sign(payload, 'SomeSecret', {expiresIn: "1h"})
}

module.exports = router;
