const express = require('express');
const aboutus = express.Router();

aboutus.get('/', function(req, res){
    res.render('aboutus');
})

module.exports = aboutus;