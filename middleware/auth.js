// middleware/auth.js
const jwt = require('jsonwebtoken');

function isAuthenticated(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        req.isAuthenticated = false;
        return next();
    }

    try {
        const secret = 'SomeSecret';
        const decoded = jwt.verify(token, secret);
        req.isAuthenticated = true;
        req.user = {
            userId: decoded.userId,
            roleId: decoded.roleId,
            roleName: decoded.roleName,
        };

        res.locals.isAuthenticated = true;
        res.locals.user = {
            userId: decoded.userId,
            roleId: decoded.roleId,
            roleName: decoded.roleName,
        };
    } catch (err) {
        req.isAuthenticated = false;
        res.locals.isAuthenticated = false;
    }
    next();
}

module.exports = isAuthenticated;