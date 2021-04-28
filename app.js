const mysql = require('mysql2');
const express = require('express');
const session = require('express-session');
const bp = require("body-parser");
const path = require('path');
const router = express.Router();
const fs = require("fs");
const { connect } = require('http2');
const { EDESTADDRREQ } = require('constants');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'itcs212',
    password: 'itcs212',
    database: 'wearhouse',
});

const app = express();
connection.connect(function (err) {
    if (err) throw err;
    console.log("Connected DB: " + "warehouse");
});
app.use("/", router);
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(bp.urlencoded({ extended: true }));
app.use(bp.json());
app.use(express.static(__dirname));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
router.use(bp.json());
router.use(bp.urlencoded({ extended: true }));
var role = "normal";

app.get('/', function (req, res) {
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

app.post('/register', function (req, res) {
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

// Login for Admin
// username: Admin
// password: Admin123
app.post('/login', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    if (username && password) {
        connection.execute('SELECT * FROM login WHERE username = ? AND password = ?', [username, password], function (error, result, fields) {
            if (result.length > 0) {
                req.session.loggedIn = true;
                req.session.username = username;
                //res.redirect('/index.html');
                res.redirect('/');
                role = result[0].role;
                console.log(username + ", role: " + role);
            } else {
                res.send('Incorrect username and password!');
            }
            res.end();
        });
    } else {
        res.send('Please enter username and password!');
        res.end();
    }
});

// Insert user // Please login as admin first
// method: POST
// URL: http://localhost:3030/user
// body: raw JSON
// 1st testcase
// {
//     "userinfo": {
//         "fname": "Bruce",
//         "lname": "Wayne",
//         "address": "Gotham",
//         "age": 40,
//         "email": "iamBATMAN@gmail.com"
//     },
//     "login": {
//         "username": "Batman",
//         "password": "IamBATMAN555",
//         "role": "normal"
//     }
// }
// 2nd testcase
// {
//     "userinfo": {
//         "fname": "Peter",
//         "lname": "Parker",
//         "address": "Manhattan",
//         "age": 25,
//         "email": "friendlyneighbor@gmail.com"
//     },
//     "login": {
//         "username": "Spiderman",
//         "password": "Spiderman123",
//         "role": "normal"
//     }
// }
router.post('/user', function (req, res) {
    req.body = "//ffgdbghfn";
    let userinfo = req.body.userinfo;
    let login = req.body.login;
    console.log(userinfo);

    if(role != "admin"){
        return res.status(400).send({ error: true, message: 'Please login as administrator' });
    }
    if (!userinfo) {
        return res.status(400).send({ error: true, message: 'Please provide user information' });
    }
    connection.query("INSERT INTO userinfo SET ? ", userinfo, function (error, results) {
        if (error) throw error;
        connection.query("INSERT INTO login SET ? ", login, function (error, results){
            if (error) throw error;
            return res.send({error: false, data: results.affectedRows, message: 'New user has been created successfully.'});
        });
    });
});

// Update user // Please login as admin first
// method: PUT
// URL: http://localhost:3030/user
// body: raw JSON
// 1st testcase
// {
//     "userinfo": {
//         "id": 3,
//         "address": "New York",
//         "age": 26
//     },
//     "login": {
//         "password": "Updated123",
//     }
// }
// 2nd testcase
// {
//     "userinfo": {
//         "id": 2,
//         "address": "Mahidol",
//         "age": 19
//     },
//     "login": {
//         "password": "UpdatedV2",
//     }
// }
router.put('/user', function (req, res) {
    let user_id = req.body.userinfo.id;
    let user = req.body.userinfo;
    let login = req.body.login;
    let login_id = user_id;
    
    if(role != "admin"){
        console.log('Please login as administrator');
        return res.status(400).send({ error: true, message: 'Please login as administrator' });
    }

    if (!user_id || !user) {
        return res.status(400).send({ error: user, message: 'Please provide user information' });
    }
    connection.query("UPDATE userinfo SET ? WHERE id = ?", [user, user_id], function (error,results) {
        if (error) throw error;
        connection.query("UPDATE login SET ? WHERE id = ?", [login, user_id], function (error,results) {
            if (error) throw error;
            return res.send({error: false, data: results.affectedRows, message: 'User has been updated successfully.'})
        });
    });
});

// Delete user // Please login as admin first
// method: DELETE
// URL: http://localhost:3030/user
// body: raw JSON
// 1st testcase
// {
//     "id": 2
// }
// 2nd testcase
// {
//     "id": 3
// }
router.delete('/user', function (req, res) {
    let user_id = req.body.id;
    if(role != "admin"){
        console.log('Please login as administrator');
        return res.status(400).send({ error: true, message: 'Please login as administrator' });
    }
    
    if (!user_id) {
        return res.status(400).send({ error: true, message: 'Please provide user id' });
    }
    connection.query('DELETE FROM login WHERE id = ?', [user_id], function (error, results)
    {
        if (error) throw error;
        connection.query('DELETE FROM userinfo WHERE id = ?', [user_id], function (error, results){
            if (error) throw error;
            return res.send({ error: false, data: results.affectedRows, message: 'User has been deleted successfully.' });
        });
    });
});

// View all user info  // Please login as Admin first
// method: GET
// URL: http://localhost:3030/user
router.get('/user', function (req, res) {
    if(role != "admin"){
        console.log('Please login as administrator');
        return res.status(400).send({ error: true, message: 'Please login as administrator' });
    }

    connection.query('SELECT * FROM userinfo', function (error, results) {
        if (error) throw error;
        return res.send({ error: false, data: results, message: 'User list.' });
    });
});

// Search a user info by id, address or firstname
// Please login as Admin first
// method: GET
// 1st testcase
// URL: http://localhost:3030/user/1
// 2nd testcase
// URL: http://localhost:3030/user/Admin
// 3rd testcase
// URL: http://localhost:3030/user/Asgard
router.get('/user/:param', function (req, res) {
    let user = req.params.param;
    if(role != "admin"){
        console.log('Please login as administrator');
        return res.status(400).send({ error: true, message: 'Please login as administrator' });
    }

    if (!user) {
        return res.status(400).send({ error: true, message: 'Please provide user id, firstname or address.' });
    }
    connection.query('SELECT * FROM userinfo where id=? or fname LIKE ? or address LIKE ?', [user, user, user], function (error, results) {
        if (error) throw error;
        return res.send({ error: false, data: results[0], message: 'User retrieved' });
    });
});

//////////////////////////// Product query ////////////////////////////////////////
// Insert product // Please login as admin first
// method: POST
// URL: http://localhost:3030/product
// body: raw JSON
// 1st testcase
// {
//     "product": {
//         "Pname": "IRON MAN MK52",
//         "review_rate": "100",
//         "price": "5000"
//     }
// }
// 2nd testcase
// {
//     "product": {
//         "Pname": "CUTE & SEXY PAJAMA",
//         "review_rate": "100",
//         "price": "999"
//     }
// }
router.post('/product', function (req, res) {

    let product = req.body.product;
    console.log(product);

    if(role != "admin"){
        console.log('Please login as administrator');
        return res.status(400).send({ error: true, message: 'Please login as administrator' });
    }

    if (!product) {
        return res.status(400).send({ error: true, message: 'Please provide product information' });
    }
    connection.query("INSERT INTO product SET ? ", product, function (error, results) {
        if (error) throw error;
        return res.send({error: false, data: results.affectedRows, message: 'New product has been created successfully.'});
    });
});

// Update product // Please login as admin first
// method: PUT
// URL: http://localhost:3030/product
// body: raw JSON
// 1st testcase
// {
//     "product": {
//         "Pid": 4,
//         "Pname": "IRON MAN MK52 COLOR RED",
//         "review_rate": "80"
//     }
// }
// 2nd test case
// {
//     "product": {
//         "Pid": 3,
//         "Pname": "ASSASSINS CREED EZIO HOODIE",
//         "review_rate": "100"
//     }
// }
router.put('/product', function (req, res) {

    let product_id = req.body.product.Pid;
    let product = req.body.product;

    if(role != "admin"){
        console.log('Please login as administrator');
        return res.status(400).send({ error: true, message: 'Please login as administrator' });
    }

    if (!product_id || !product) {
        return res.status(400).send({ error: product, message: 'Please provide user information' });
    }
    connection.query("UPDATE product SET ? WHERE Pid = ?", [product, product_id], function (error,results) {
        if (error) throw error;
        return res.send({error: false, data: results.affectedRows, message: 'Product has been updated successfully.'})
    });
});

// Delete product // Please login as admin first
// method: DELETE
// URL: http://localhost:3030/product
// body: raw JSON
// 1st testcase
// {
//     "Pid": 4
// }
// 2nd test case
// {
//     "Pid": 2
// }
router.delete('/product', function (req, res) {

    let product_id = req.body.Pid;

    if(role != "admin"){
        console.log('Please login as administrator');
        return res.status(400).send({ error: true, message: 'Please login as administrator' });
    }

    if (!product_id) {
        return res.status(400).send({ error: true, message: 'Please provide user id' });
    }
    connection.query('DELETE FROM product WHERE Pid = ?', [product_id], function (error, results)
    {
        if (error) throw error;
        return res.send({ error: false, data: results.affectedRows, message: 'User has been deleted successfully.' });
    });
});

// View all products
// method: GET
// URL: http://localhost:3030/product
router.get('/product', function (req, res) {
    connection.query('SELECT * FROM product', function (error, results) {
        if (error) throw error;
        return res.send({ error: false, data: results, message: 'product list.' });
    });
});

// Search products by product id, name or maximun price
// method: GET
// test case 1
// URL: http://localhost:3030/product/2
// test case 2
// URL: http://localhost:3030/product/UNISEX
// test case 3
// URL: http://localhost:3030/product/1000
router.get('/product/:param', function (req, res) {
    let product = req.params.param;
    if (!product) {
        return res.status(400).send({ error: true, message: 'Please provide product id, product name or maximum price.' });
    }
    connection.query('SELECT * FROM product where Pid=? or Pname LIKE ? or price<?', [product, '%'+product+'%', product], function (error, results) {
        if (error) throw error;
        return res.send({ error: false, data: results[0], message: 'product retrieved' });
    });
});

var search_product;
router.get('/product-search', function (req, res) {
    search_product = req.query.searchbox;
    if (!search_product) {
        return res.status(400).send({ error: true, message: 'Please provide product id, product name or maximum price.' });
    }

    return res.redirect('/result');
    // connection.query('SELECT * FROM product where Pid=? or Pname LIKE ? or price<?', [product, '%'+product+'%', product], function (error, results) {
    //     if (error) throw error;
    //     //return res.send({ error: false, data: results[0], message: 'product retrieved' });
    //     //return redirect(''+results[0].Pid);
    // });
});

// Eye password function
function togglePW() {
    document.querySelector('.eye').classList.toggle('slash');
    var password = document.querySelector('[name=password]');
    if (password.getAttribute('type') === 'password') {
        password.setAttribute('type', 'text');
    } else {
        password.setAttribute('type', 'password');
    }
}

//////////////////  Webpage link  ///////////////////////
app.get('/login', function (req, res){
    if(req.session.loggedIn){
        req.session.loggedIn = false;
        res.redirect('/');
    }else {
        res.render('login');
    }
    
});
app.get('/register', function (req, res){
    res.render('register');
});
app.get('/aboutus', function (req, res){
    res.render('aboutus');
});
app.get('/result', function (req, res){
    connection.query('SELECT * FROM product where Pid=? or Pname LIKE ? or price<?', [search_product, '%'+search_product+'%', search_product], function (error, results) {
        if (error) throw error;
        res.render('result', {
            search_result: JSON.stringify(results, null, 3),
        });
    });
});
app.get('/search', function (req, res){
    res.render('search');
});

//PORT3030
app.listen(3030, function () {
    console.log("Server listening at Port 3030");
});