const express = require('express');
const home = express.Router();

home.get('/', function (req, res) {
    if (req.session.loggedIn) {
        res.render('index', {
            user: req.session.username,
            login_staus: req.session.loggedIn,
            login_str: 'Logout'
        });
    } else {
        res.render('index', {
            login_staus: req.session.loggedIn,
            login_str: 'Login'
        });
    }
    res.end();
});

module.exports = home;