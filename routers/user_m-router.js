const express = require('express');
const user_manage = express.Router();

user_manage.get('/', function (req, res) {
    if (req.session.username == "Admin") {
        res.render('user_manage.ejs', {
            user: req.session.username,
            login_staus: req.session.loggedIn,
            login_str: 'Logout'
        });
    }
    res.end();
});

module.exports = user_manage;