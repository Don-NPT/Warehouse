const mysql = require('mysql2');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'itcs212',
    password: 'itcs212',
    database: 'wearhouse'
});
connection.connect(function (err) {
    if (err) throw err;
    console.log("Connected DB: " + "warehouse");
});

module.exports.connection = connection;