function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated) {
        return next();
    } else {
        // Отправить сообщение об ошибке или перенаправить на страницу входа
        res.redirect('/login');
    }
}

module.exports = ensureAuthenticated;