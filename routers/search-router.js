const express = require('express');
const search = express.Router();

search.get('/', function (req, res){
    var login_str;
    if(req.session.loggedIn){
        login_str = "Logout";
    }else{
        login_str = "Login";
    }
    console.log('role in search: '+ req.session.role);
    res.render('search', {
        user: req.session.username,
        role: req.session.role,
        login_str: login_str
    });
});

search.get('/product', function (req, res) {
    var search_product = req.query.query;
    if (!search_product) {
        return res.status(400).send({ error: true, message: 'Please provide product id, product name or maximum price.' });
    }
    return res.redirect('/product?query='+search_product);
});

search.get('/user', function (req, res) {
    var search_user = req.query.query;
    if (!search_user) {
        return res.status(400).send({ error: true, message: 'Please provide user id, user name or address.' });
    }
    return res.redirect('/user?query='+search_user);
});

module.exports = search;