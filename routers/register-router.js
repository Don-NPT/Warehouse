const express = require('express');
const connection = require('../resources/mysql2-connect').connection;
const register = express.Router();

register.get('/', function (req, res){
    res.render('register');
});

register.post('/', function (req, res) {
    var fname = req.body.firstname;
    var lname = req.body.lastname;
    var address = req.body.address;
    var age = req.body.age;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var sql1 = 'INSERT INTO userinfo (fname, lname, address, age, email) VALUES (?,?,?,?,?);';
    var sql2 = "INSERT INTO login (id, username, password, role) VALUES (?,?,?, 'normal');";
    var id = 1000;
    if (fname && lname && address && age && email && username && password) {
        connection.execute(sql1, [fname, lname, address, age, email], function (error, results, field) {
            if (error == null) {
                console.log('Personal info stored!');
                id = results.insertId;
                connection.execute(sql2, [id, username, password], function (error2, results2, field2) {
                    res.send("Registration Completed! Go to <a href='/login'>Login<a>");
                    console.log('Login info stored!');
                    res.end(); 
                });
            } else {
                res.send('Your username or email has been used!');
                console.log(error);
                res.end(); 
            }
        });
        
    } else {
        res.send('Please enter the information!');
        res.end();
    }

    
});

module.exports = register;