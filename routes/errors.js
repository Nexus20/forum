const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/500', function (req, res, next) {
    res.render('error500', {title: '500 Internal Server Error'});
});

module.exports = router;