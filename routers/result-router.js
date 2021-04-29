const express = require('express');
const result = express.Router();

// Use this code if you want to connect with DB
const ResultMng = require('../models/result-model').ResultMng;
const resultMng = new ResultMng();

result.get('/', async function (req, res){
    var login_str;
    let query = req.query.query;
    console.log(req.query.query )
    const results = await resultMng.getProduct(query);

    if(req.session.loggedIn){
        login_str = "Logout";
    }else{
        login_str = "Login";
    }
    res.render('result',{
        'results': results,
        'query': query,
        user: req.session.username,
        role: req.session.role,
        login_str: login_str
    });
});

result.get('/all', async function (req, res){
    console.log("Show all products");
    const results = await resultMng.getAllProduct();

    var login_str;
    if(req.session.loggedIn){
        login_str = "Logout";
    }else{
        login_str = "Login";
    }

    res.render('result',{
        'results': results,
        'query': "all",
        user: req.session.username,
        role: req.session.role,
        login_str: login_str
    });
});

module.exports = result;