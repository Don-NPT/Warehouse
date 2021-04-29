const express = require('express');
const connection = require('../resources/mysql2-connect').connection;
const login = express.Router();

login.get('/', function (req, res){
    if(req.session.loggedIn){
        req.session.loggedIn = false;
        res.redirect('/');
        req.session.role = "normal";
        req.session.username = "guest";
        console.log(req.session.username + ", role: " + req.session.role);
    }else {
        res.render('login');
    }
});

login.post('/', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    if (username && password) {
        connection.execute('SELECT * FROM login WHERE username = ? AND password = ?', [username, password], function (error, result, fields) {
            if (result.length > 0) {
                req.session.loggedIn = true;
                req.session.username = username;
                res.redirect('/');
                req.session.role = result[0].role;
                console.log(req.session.username + ", role: " + req.session.role);
            } else {
                res.send('Incorrect username and password!');
                console.log(result);
            }
            res.end();
        });
    } else {
        res.send('Please enter username and password!');
        res.end();
    }
});

module.exports = login;