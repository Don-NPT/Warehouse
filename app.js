//const mysql = require('mysql2');
const express = require('express');
const session = require('express-session');
const bp = require("body-parser");
const path = require('path');
const router = express.Router();
const app = express();
const connection = require('./resources/mysql2-connect').connection;
const aboutus = require('./routers/aboutus-router');
const login = require('./routers/login-router');
const register = require('./routers/register-router');
const home = require('./routers/home-router');
const search = require('./routers/search-router');
const result = require('./routers/result-router');
const user_manage = require('./routers/user_m-router');

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

//////////////////  Webpage link  ///////////////////////
app.use('/', home);
app.use('/login', login);
app.use('/register', register);
app.use('/aboutus', aboutus);
app.use('/search', search);
app.use('/product', result);
app.use('/user', result);
app.use('/usermanage', user_manage);

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
// router.get('/product-search', function (req, res) {
//     search_product = req.query.searchbox;
//     if (!search_product) {
//         return res.status(400).send({ error: true, message: 'Please provide product id, product name or maximum price.' });
//     }

//     return res.redirect('/result');
//     // connection.query('SELECT * FROM product where Pid=? or Pname LIKE ? or price<?', [product, '%'+product+'%', product], function (error, results) {
//     //     if (error) throw error;
//     //     //return res.send({ error: false, data: results[0], message: 'product retrieved' });
//     //     //return redirect(''+results[0].Pid);
//     // });
// });

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


//PORT3030
app.listen(3030, function () {
    console.log("Server listening at Port 3030");
});